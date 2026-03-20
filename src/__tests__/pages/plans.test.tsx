import { render, screen } from '@testing-library/react'
import { createClient } from '@/lib/supabase/server'
import PlansPage from '@/app/(feed)/plans/page'

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
    data: { user: email ? { id: 'uid', email } : null },
  })
  // @ts-expect-error partial mock
  mockCreateClient.mockResolvedValue({ auth: { getUser } })
}

describe('Plans page', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders plans overview for authenticated user', async () => {
    setupUser('user@example.com')
    render(await PlansPage())
    expect(screen.getByText('🎟️ Mijn Plans')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    setupUser('user@example.com')
    render(await PlansPage())
    expect(screen.getByText('Nog geen plans')).toBeInTheDocument()
  })

  it('shows tabs', async () => {
    setupUser('user@example.com')
    render(await PlansPage())
    expect(screen.getByText('Aankomend')).toBeInTheDocument()
    expect(screen.getByText('Geweest')).toBeInTheDocument()
  })

  it('has link to create new plan', async () => {
    setupUser('user@example.com')
    render(await PlansPage())
    const links = screen.getAllByRole('link', { name: /Nieuw plan|Plan aanmaken/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('redirects unauthenticated users', async () => {
    setupUser(null)
    await expect(PlansPage()).rejects.toThrow('NEXT_REDIRECT:/auth/login')
  })
})
