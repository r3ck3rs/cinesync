import { render, screen, fireEvent, act } from '@testing-library/react'
import NewPlanPage from '@/app/(feed)/plans/new/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

jest.mock('@/lib/tmdb', () => ({
  searchMovies: jest.fn().mockResolvedValue([
    { id: 1, title: 'Dune: Part Two', release_date: '2024-03-01', poster_path: '/dune.jpg', overview: 'Epic sci-fi', vote_average: 8.5 },
  ]),
  getPosterUrl: jest.fn((path: string) => `https://image.tmdb.org/t/p/w185${path}`),
  getReleaseYear: jest.fn((date: string) => date.slice(0, 4)),
}))

describe('New Plan page', () => {
  it('renders step 1 with movie search and cinema input', () => {
    render(<NewPlanPage />)
    expect(screen.getByText('🎬 Plan aanmaken')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Zoek een film...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Bijv. Pathé Rotterdam')).toBeInTheDocument()
  })

  it('next button is disabled when no movie selected', () => {
    render(<NewPlanPage />)
    expect(screen.getByRole('button', { name: /Volgende/i })).toBeDisabled()
  })

  it('shows movie search results after typing', async () => {
    render(<NewPlanPage />)
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), {
        target: { value: 'Dune' },
      })
      await new Promise(r => setTimeout(r, 500))
    })
    expect(await screen.findByText('Dune: Part Two')).toBeInTheDocument()
  })

  it('selects a movie and enables next after filling cinema', async () => {
    render(<NewPlanPage />)
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), {
        target: { value: 'Dune' },
      })
      await new Promise(r => setTimeout(r, 500))
    })
    fireEvent.click(await screen.findByText('Dune: Part Two'))
    fireEvent.change(screen.getByPlaceholderText('Bijv. Pathé Rotterdam'), {
      target: { value: 'Pathé Rotterdam' },
    })
    expect(screen.getByRole('button', { name: /Volgende/i })).not.toBeDisabled()
  })

  it('shows audience options on step 3', async () => {
    render(<NewPlanPage />)
    // Select movie
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Zoek een film...'), { target: { value: 'Dune' } })
      await new Promise(r => setTimeout(r, 500))
    })
    await act(async () => {
      fireEvent.click(await screen.findByText('Dune: Part Two'))
    })
    fireEvent.change(screen.getByPlaceholderText('Bijv. Pathé Rotterdam'), { target: { value: 'Bioscoop' } })
    fireEvent.click(screen.getByRole('button', { name: /Volgende/i }))
    // Step 2
    await act(async () => {
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2026-04-01' } })
      fireEvent.change(timeInput, { target: { value: '20:00' } })
      fireEvent.click(screen.getByRole('button', { name: /Volgende/i }))
    })
    // Step 3
    expect(screen.getByText('Wie mag meedoen?')).toBeInTheDocument()
  })
})
