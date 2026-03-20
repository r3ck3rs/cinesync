import { render, screen } from '@testing-library/react'
import { createClient } from '@/lib/supabase/server'
import FeedPage from '@/app/(feed)/feed/page'

// next/navigation redirect throws to stop execution, just like the real Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// Mock the entire server module; individual tests configure getUser via mockResolvedValue
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

jest.mock('@/lib/tmdb', () => ({
  getPosterUrl: jest.fn((path: string) => `https://image.tmdb.org/t/p/w185${path}`),
  searchMovies: jest.fn().mockResolvedValue([]),
}))

// Mock screenings lib to avoid cheerio/undici ReadableStream dependency in jsdom
jest.mock('@/lib/screenings', () => ({
  getRotterdamScreenings: jest.fn().mockResolvedValue([]),
  flattenScreenings: jest.fn().mockReturnValue([]),
}))

jest.mock('@/components/ScreeningCard', () => ({
  __esModule: true,
  default: () => <div data-testid="screening-card" />,
}))

jest.mock('@/components/DayNav', () => ({
  __esModule: true,
  default: ({ currentDay }: { currentDay: string }) => (
    <div data-testid="day-nav">{currentDay}</div>
  ),
}))

function setupUser(email: string | null) {
  const getUser = jest.fn().mockResolvedValue({
    data: { user: email ? { id: 'uid', email } : null },
  })
  const chainable = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  }
  // @ts-expect-error partial mock
  mockCreateClient.mockResolvedValue({ auth: { getUser }, from: jest.fn(() => chainable) })
}

describe('Feed page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the CineSync header for an authenticated user', async () => {
    setupUser('user@example.com')
    render(await FeedPage({ searchParams: {} }))
    expect(screen.getByText('🎬 CineSync')).toBeInTheDocument()
  })

  it('shows the empty state when there are no screenings', async () => {
    setupUser('user@example.com')
    render(await FeedPage({ searchParams: {} }))
    expect(screen.getByText('Geen voorstellingen gevonden')).toBeInTheDocument()
  })

  it('shows bottom navigation', async () => {
    setupUser('user@example.com')
    render(await FeedPage({ searchParams: {} }))
    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Plans')).toBeInTheDocument()
    expect(screen.getByText('Profiel')).toBeInTheDocument()
  })

  it('renders without crashing for unauthenticated users', async () => {
    setupUser(null)
    const result = await FeedPage({ searchParams: {} })
    render(result)
    expect(screen.getByText('🎬 CineSync')).toBeInTheDocument()
  })
})
