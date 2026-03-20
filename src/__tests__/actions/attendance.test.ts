/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/server')
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { toggleAttendance } from '@/app/actions/attendance'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

/**
 * Creates a Supabase query-chain mock that:
 * - Returns `this` for chainable methods (select, eq, delete)
 * - Resolves to `result` when awaited directly (via .then) or via .single()
 * - Resolves insert() immediately
 */
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}

  chain.select = jest.fn(() => chain)
  chain.eq = jest.fn(() => chain)
  chain.delete = jest.fn(() => chain)
  chain.insert = jest.fn(() => Promise.resolve({ error: null }))
  chain.single = jest.fn(() => Promise.resolve(result))
  // Make the chain itself a thenable so `await chain` resolves to result
  chain.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  chain.catch = (handler: (e: unknown) => unknown) =>
    Promise.resolve(result).catch(handler)
  chain.finally = (handler: () => void) =>
    Promise.resolve(result).finally(handler)

  return chain
}

const TEST_PARAMS = {
  movieSlug: 'movie-slug',
  movieTitle: 'Movie Title',
  cinema: 'Test Cinema',
  cinemaSlug: 'test-cinema',
  showtime: '2026-03-20T20:00:00+01:00',
}

describe('toggleAttendance', () => {
  let mockFrom: jest.Mock
  let mockGetUser: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockFrom = jest.fn()
    mockGetUser = jest.fn()
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as never)
  })

  it('throws when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await expect(toggleAttendance(TEST_PARAMS)).rejects.toThrow('Not authenticated')
  })

  it('calls supabase insert when not yet attending', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    const checkChain = makeChain({ data: null, error: null })
    const insertChain = makeChain({ error: null })
    const attendeesChain = makeChain({ data: [], error: null })

    mockFrom
      .mockReturnValueOnce(checkChain)     // check existing attendance
      .mockReturnValueOnce(insertChain)    // insert new attendance
      .mockReturnValueOnce(attendeesChain) // fetch updated attendee list

    await toggleAttendance(TEST_PARAMS)

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        movie_slug: 'movie-slug',
        cinema_slug: 'test-cinema',
        showtime: '2026-03-20T20:00:00+01:00',
      })
    )
  })

  it('calls supabase delete when already attending', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    const checkChain = makeChain({ data: { id: 'attendance-abc' }, error: null })
    const deleteChain = makeChain({ error: null })
    const attendeesChain = makeChain({ data: [], error: null })

    mockFrom
      .mockReturnValueOnce(checkChain)
      .mockReturnValueOnce(deleteChain)
      .mockReturnValueOnce(attendeesChain)

    await toggleAttendance(TEST_PARAMS)

    expect(deleteChain.delete).toHaveBeenCalled()
    expect(deleteChain.eq).toHaveBeenCalledWith('id', 'attendance-abc')
  })

  it('returns { attending: true } after insert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    mockFrom
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))

    const result = await toggleAttendance(TEST_PARAMS)
    expect(result.attending).toBe(true)
  })

  it('returns { attending: false } after delete', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    mockFrom
      .mockReturnValueOnce(makeChain({ data: { id: 'attendance-abc' }, error: null }))
      .mockReturnValueOnce(makeChain({ error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))

    const result = await toggleAttendance(TEST_PARAMS)
    expect(result.attending).toBe(false)
  })
})
