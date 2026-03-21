'use client'

import { useState, useTransition } from 'react'
import { toggleAttendance, AttendeeInfo } from '@/app/actions/attendance'
import Avatar from './Avatar'

interface AttendanceButtonProps {
  movieSlug: string
  movieTitle: string
  moviePosterPath?: string
  cinema: string
  cinemaSlug: string
  showtime: string
  ticketUrl?: string
  initialIsGoing: boolean
  initialAttendees: AttendeeInfo[]
  userId?: string
  currentUserFirstName?: string
  currentUserLastName?: string
  currentUserAvatarUrl?: string
}

export default function AttendanceButton({
  movieSlug,
  movieTitle,
  moviePosterPath,
  cinema,
  cinemaSlug,
  showtime,
  ticketUrl,
  initialIsGoing,
  initialAttendees,
  userId,
  currentUserFirstName,
  currentUserLastName,
  currentUserAvatarUrl,
}: AttendanceButtonProps) {
  const [isGoing, setIsGoing] = useState(initialIsGoing)
  const [attendees, setAttendees] = useState(initialAttendees)
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

    if (isGoing) {
      setIsGoing(false)
      setAttendees(attendees.filter((a) => a.userId !== userId))
    } else {
      setIsGoing(true)
      setAttendees([
        ...attendees,
        {
          userId,
          firstName: currentUserFirstName,
          lastName: currentUserLastName,
          avatarUrl: currentUserAvatarUrl,
        },
      ])
    }

    startTransition(async () => {
      try {
        const result = await toggleAttendance({
          movieSlug,
          movieTitle,
          moviePosterPath,
          cinema,
          cinemaSlug,
          showtime,
          ticketUrl,
        })

        const enriched = result.attendees.map(a =>
          a.userId === userId && !a.firstName
            ? { ...a, firstName: currentUserFirstName, lastName: currentUserLastName, avatarUrl: currentUserAvatarUrl }
            : a
        )

        // Guard: if server says attending but user is missing (RLS profile join can fail silently)
        const finalAttendees =
          result.attending && !enriched.some((a) => a.userId === userId)
            ? [...enriched, { userId: userId!, firstName: currentUserFirstName, lastName: currentUserLastName, avatarUrl: currentUserAvatarUrl }]
            : enriched

        setIsGoing(result.attending)
        setAttendees(finalAttendees)
      } catch {
        setIsGoing(initialIsGoing)
        setAttendees(initialAttendees)
      }
    })
  }

  return (
    <div className={`flex items-center${isPending ? ' opacity-60' : ''}`}>
      {attendees.map((a, i) => (
        <div
          key={a.userId}
          style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: attendees.length - i }}
        >
          <Avatar
            userId={a.userId}
            firstName={a.firstName}
            lastName={a.lastName}
            avatarUrl={a.avatarUrl}
            size="sm"
          />
        </div>
      ))}
      <button
        onClick={handleClick}
        disabled={isPending}
        style={{ marginLeft: attendees.length > 0 ? '-8px' : 0, zIndex: 0 }}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-[var(--surface)] transition-all ${
          isGoing
            ? 'bg-white text-black'
            : 'bg-[var(--subtle)] text-[var(--muted)] hover:bg-white hover:text-black'
        }`}
      >
        {isGoing ? '✓' : '+'}
      </button>
    </div>
  )
}
