/**
 * @jest-environment node
 */
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, 'http://localhost:3000'))
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('allows unauthenticated access to the public landing page', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await middleware(makeRequest('/'))
    expect(res.status).toBe(200)
  })

  it('redirects unauthenticated users from /feed to /auth/login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await middleware(makeRequest('/feed'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth/login')
  })

  it('redirects unauthenticated users from /plans to /auth/login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await middleware(makeRequest('/plans'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth/login')
  })

  it('redirects authenticated users away from /auth/login to /', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'abc123', email: 'user@example.com' } },
    })
    const res = await middleware(makeRequest('/auth/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('redirects authenticated users away from /auth/register to /', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'abc123', email: 'user@example.com' } },
    })
    const res = await middleware(makeRequest('/auth/register'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('allows authenticated users to access protected routes', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'abc123', email: 'user@example.com' } },
    })
    const res = await middleware(makeRequest('/feed'))
    expect(res.status).toBe(200)
  })
})
