import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Not Found page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows descriptive message', () => {
    render(<NotFound />)
    expect(screen.getByText('Pagina niet gevonden')).toBeInTheDocument()
  })

  it('has link back to home', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /Terug naar home/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
