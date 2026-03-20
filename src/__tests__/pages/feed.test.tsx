import { render, screen } from '@testing-library/react'
import { createClient } from '@/lib/supabase/server'
import FeedPage from '@/app/(feed)/feed/page'

// next/navigation redirect throws to stop execution, just like the real Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// Mock the entire server module; individual tests configure getUser via mockResolvedValue
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function setupUser(email: string | null) {
  const getUser = jest.fn().mockResolvedValue({
    data: { user: email ? { id: 'uid', email } : null },
  })
  // @ts-expect-error partial mock
  mockCreateClient.mockResolvedValue({ auth: { getUser } })
}

describe('Feed page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the CineSync header for an authenticated user', async () => {
    setupUser('user@example.com')
    render(await FeedPage())
    expect(screen.getByText('🎬 CineSync')).toBeInTheDocument()
  })

  it('shows the empty state when there are no plans', async () => {
    setupUser('user@example.com')
    render(await FeedPage())
    expect(screen.getByText('Geen plans vanavond')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Plan aanmaken/i })).toHaveAttribute(
      'href',
      '/plans/new'
    )
  })

  it('shows bottom navigation', async () => {
    setupUser('user@example.com')
    render(await FeedPage())
    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Plans')).toBeInTheDocument()
    expect(screen.getByText('Profiel')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to /auth/login', async () => {
    setupUser(null)
    await expect(FeedPage()).rejects.toThrow('NEXT_REDIRECT:/auth/login')
  })
})
