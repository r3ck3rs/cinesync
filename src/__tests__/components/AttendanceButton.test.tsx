import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('@/app/actions/attendance', () => ({
  toggleAttendance: jest.fn(),
}))

jest.mock('@/components/Avatar', () => ({
  __esModule: true,
  default: ({ firstName, lastName }: { firstName?: string; lastName?: string }) => (
    <div data-testid="avatar">{firstName?.[0]}{lastName?.[0]}</div>
  ),
}))

import AttendanceButton from '@/components/AttendanceButton'
import { toggleAttendance } from '@/app/actions/attendance'

const baseProps = {
  movieSlug: 'film-1',
  movieTitle: 'Film 1',
  cinema: 'Cinerama',
  cinemaSlug: 'cinerama',
  showtime: '2026-04-16T19:00:00.000Z',
  initialIsGoing: false,
  initialAttendees: [],
  userId: 'user-abc',
  currentUserFirstName: 'Peter',
  currentUserLastName: 'Reckers',
}

describe('AttendanceButton', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows + button when not going', () => {
    render(<AttendanceButton {...baseProps} />)
    expect(screen.getByText('+')).toBeTruthy()
  })

  it('hides + button and shows avatar after clicking join', async () => {
    ;(toggleAttendance as jest.Mock).mockResolvedValue({
      attending: true,
      attendees: [{ userId: 'user-abc', firstName: 'Peter', lastName: 'Reckers' }],
    })

    render(<AttendanceButton {...baseProps} />)
    fireEvent.click(screen.getByText('+'))

    // Optimistic: avatar appears immediately
    await waitFor(() => expect(screen.getByTestId('avatar')).toBeTruthy())
    // + button gone
    expect(screen.queryByText('+')).toBeNull()
  })

  it('shows avatar on load when initialIsGoing=true', () => {
    render(
      <AttendanceButton
        {...baseProps}
        initialIsGoing={true}
        initialAttendees={[{ userId: 'user-abc', firstName: 'Peter', lastName: 'Reckers' }]}
      />
    )
    expect(screen.getByTestId('avatar')).toBeTruthy()
    expect(screen.queryByText('+')).toBeNull()
  })

  it('avatar size equals button size (both w-6 h-6 / 24px)', () => {
    const { container } = render(<AttendanceButton {...baseProps} />)
    const button = container.querySelector('button:not(.sr-only)')
    expect(button?.className).toContain('w-6')
    expect(button?.className).toContain('h-6')
  })

  it('does not call toggleAttendance when userId not set (redirects to login instead)', () => {
    render(<AttendanceButton {...baseProps} userId={undefined} />)
    fireEvent.click(screen.getByText('+'))
    expect(toggleAttendance).not.toHaveBeenCalled()
  })
})
