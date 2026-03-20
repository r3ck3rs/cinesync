import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

const mockSignIn = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  })),
}))

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the email and password inputs', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('E-mailadres')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Wachtwoord')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /Inloggen/i })).toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /Registreer/i })).toHaveAttribute(
      'href',
      '/auth/register'
    )
  })

  it('redirects to /feed after successful login', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<LoginPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Wachtwoord'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /Inloggen/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/feed')
    })
  })

  it('shows an error message when login fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    render(<LoginPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'wrong@example.com')
    await userEvent.type(screen.getByPlaceholderText('Wachtwoord'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /Inloggen/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables the button and shows loading text while submitting', async () => {
    // Never resolves during this check
    mockSignIn.mockImplementation(() => new Promise(() => {}))
    render(<LoginPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Wachtwoord'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /Inloggen/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Bezig/i })
      expect(btn).toBeDisabled()
    })
  })
})
