import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home page (landing)', () => {
  it('renders the CineSync heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /CineSync/i })).toBeInTheDocument()
  })

  it('renders a register link pointing to /auth/register', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /Registreren/i })
    expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('renders a login link pointing to /auth/login', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /Inloggen/i })
    expect(link).toHaveAttribute('href', '/auth/login')
  })

  it('renders all three feature cards', () => {
    render(<Home />)
    expect(screen.getByText('Plan delen')).toBeInTheDocument()
    expect(screen.getByText('Vrienden uitnodigen')).toBeInTheDocument()
    expect(screen.getByText('Samen naar de film')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Home />)
    expect(
      screen.getByText(/Go to the movies together/i)
    ).toBeInTheDocument()
  })
})
