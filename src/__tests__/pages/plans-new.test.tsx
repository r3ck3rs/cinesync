import { render, screen, fireEvent } from '@testing-library/react'
import NewPlanPage from '@/app/(feed)/plans/new/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
}))

describe('New Plan page', () => {
  it('renders step 1 with movie and cinema inputs', () => {
    render(<NewPlanPage />)
    expect(screen.getByText('🎬 Plan aanmaken')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Zoek een film...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Bijv. Pathé Rotterdam')).toBeInTheDocument()
  })

  it('next button is disabled when fields are empty', () => {
    render(<NewPlanPage />)
    const next = screen.getByRole('button', { name: /Volgende/i })
    expect(next).toBeDisabled()
  })

  it('next button enables when movie and cinema are filled', () => {
    render(<NewPlanPage />)
    fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), {
      target: { value: 'Dune' },
    })
    fireEvent.change(screen.getByPlaceholderText('Bijv. Pathé Rotterdam'), {
      target: { value: 'Pathé Rotterdam' },
    })
    expect(screen.getByRole('button', { name: /Volgende/i })).not.toBeDisabled()
  })

  it('advances to step 2 after filling step 1', () => {
    render(<NewPlanPage />)
    fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), {
      target: { value: 'Dune' },
    })
    fireEvent.change(screen.getByPlaceholderText('Bijv. Pathé Rotterdam'), {
      target: { value: 'Pathé Rotterdam' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Volgende/i }))
    expect(screen.getByText('Wanneer?')).toBeInTheDocument()
  })

  it('shows audience options on step 3', () => {
    render(<NewPlanPage />)
    // Step 1
    fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), { target: { value: 'Film' } })
    fireEvent.change(screen.getByPlaceholderText('Bijv. Pathé Rotterdam'), { target: { value: 'Bioscoop' } })
    fireEvent.click(screen.getByRole('button', { name: /Volgende/i }))
    // Step 2 — fill date and time
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-04-01' } })
    fireEvent.change(timeInput, { target: { value: '20:00' } })
    fireEvent.click(screen.getByRole('button', { name: /Volgende/i }))
    // Step 3
    expect(screen.getByText('Wie mag meedoen?')).toBeInTheDocument()
  })
})
