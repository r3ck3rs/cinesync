import { render, screen } from '@testing-library/react'
import { createClient } from '@/lib/supabase/server'
import ProfilePage from '@/app/(feed)/profile/page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function setupUser(email: string | null) {
  const getUser = jest.fn().mockResolvedValue({
    data: {
      user: email
        ? { id: 'uid', email, created_at: '2026-01-01T00:00:00Z' }
        : null,
    },
  })
  // @ts-expect-error partial mock
  mockCreateClient.mockResolvedValue({ auth: { getUser } })
}

describe('Profile page', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders profile for authenticated user', async () => {
    setupUser('peter@example.com')
    render(await ProfilePage())
    expect(screen.getByText('Profiel')).toBeInTheDocument()
    expect(screen.getByText('peter@example.com')).toBeInTheDocument()
  })

  it('shows avatar initials from email', async () => {
    setupUser('peter@example.com')
    render(await ProfilePage())
    expect(screen.getByText('PE')).toBeInTheDocument()
  })

  it('shows stats (Plans, Vrienden, Films)', async () => {
    setupUser('user@example.com')
    render(await ProfilePage())
    const stats = screen.getAllByText('Plans')
    expect(stats.length).toBeGreaterThan(0)
    // Check for stat labels in the stats grid
    const allText = document.body.textContent || ''
    expect(allText).toContain('Films')
  })

  it('has sign out button', async () => {
    setupUser('user@example.com')
    render(await ProfilePage())
    expect(screen.getByRole('button', { name: /Uitloggen/i })).toBeInTheDocument()
  })

  it('redirects unauthenticated users', async () => {
    setupUser(null)
    await expect(ProfilePage()).rejects.toThrow('NEXT_REDIRECT:/auth/login')
  })
})
