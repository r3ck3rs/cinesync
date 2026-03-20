import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/auth/register/page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

const mockSignUp = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}))

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the email and password inputs', () => {
    render(<RegisterPage />)
    expect(screen.getByPlaceholderText('E-mailadres')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Wachtwoord/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: /Registreer/i })).toBeInTheDocument()
  })

  it('renders a link to the login page', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('link', { name: /Inloggen/i })).toHaveAttribute(
      'href',
      '/auth/login'
    )
  })

  it('shows email confirmation screen after successful registration', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    render(<RegisterPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'newuser@example.com')
    await userEvent.type(screen.getByPlaceholderText(/Wachtwoord/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /Registreer/i }))

    await waitFor(() => {
      expect(screen.getByText(/Check je e-mail/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/newuser@example\.com/i)).toBeInTheDocument()
  })

  it('shows an error message when registration fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } })
    render(<RegisterPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'exists@example.com')
    await userEvent.type(screen.getByPlaceholderText(/Wachtwoord/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /Registreer/i }))

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
    })
  })

  it('calls signUp with the correct email and password', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    render(<RegisterPage />)

    await userEvent.type(screen.getByPlaceholderText('E-mailadres'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText(/Wachtwoord/i), 'securepass')
    await userEvent.click(screen.getByRole('button', { name: /Registreer/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securepass',
      })
    })
  })
})
