import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

import DayNav from '@/components/DayNav'

describe('DayNav', () => {
  it('renders without crashing', () => {
    const { container } = render(<DayNav currentDay="2026-04-16" />)
    expect(container).toBeTruthy()
  })

  it('shows Vandaag label when currentDay is today', () => {
    const today = new Date().toISOString().slice(0, 10)
    render(<DayNav currentDay={today} />)
    expect(screen.getByText('Vandaag')).toBeTruthy()
  })

  it('does not show Vandaag label for other days', () => {
    render(<DayNav currentDay="2026-04-16" />)
    expect(screen.queryByText('Vandaag')).toBeNull()
  })

  it('Vandaag label has no hardcoded purple/gradient styling', () => {
    const today = new Date().toISOString().slice(0, 10)
    const { container } = render(<DayNav currentDay={today} />)
    const html = container.innerHTML
    expect(html).not.toContain('#7c6ff7')
    expect(html).not.toContain('#ec4899')
    expect(html).not.toContain('linear-gradient')
  })
})
