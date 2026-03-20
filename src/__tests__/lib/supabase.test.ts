import { createClient } from '@/lib/supabase/client'
import { createBrowserClient } from '@supabase/ssr'

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      signOut: jest.fn(),
    },
  })),
}))

const mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<
  typeof createBrowserClient
>

describe('Supabase browser client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('creates and returns a supabase client', () => {
    const client = createClient()
    expect(client).toBeDefined()
  })

  it('calls createBrowserClient with the env vars', () => {
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })

  it('returned client exposes the auth interface', () => {
    const client = createClient()
    expect(client.auth).toBeDefined()
    expect(typeof client.auth.signInWithPassword).toBe('function')
    expect(typeof client.auth.signUp).toBe('function')
    expect(typeof client.auth.getUser).toBe('function')
    expect(typeof client.auth.signOut).toBe('function')
  })

  it('creates a new client on every call', () => {
    createClient()
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2)
  })
})
