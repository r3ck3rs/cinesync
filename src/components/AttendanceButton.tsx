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
      // Optimistic: remove self
      setIsGoing(false)
      setAttendees(attendees.filter((a) => a.userId !== userId))
    } else {
      // Optimistic: add self
      setIsGoing(true)
      const alreadyIn = attendees.some((a) => a.userId === userId)
      if (!alreadyIn) {
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

        // Enrich server response with local profile data when missing
        const enriched: AttendeeInfo[] = result.attendees.map(a =>
          a.userId === userId && !a.firstName
            ? { ...a, firstName: currentUserFirstName, lastName: currentUserLastName, avatarUrl: currentUserAvatarUrl }
            : a
        )

        // Guard: server says attending but profile join missed current user (RLS edge case)
        const hasSelf = enriched.some((a) => a.userId === userId)
        const finalAttendees = result.attending && !hasSelf
          ? [...enriched, { userId: userId!, firstName: currentUserFirstName, lastName: currentUserLastName, avatarUrl: currentUserAvatarUrl }]
          : enriched

        setIsGoing(result.attending)
        setAttendees(finalAttendees)
      } catch {
        // Rollback on error
        setIsGoing(initialIsGoing)
        setAttendees(initialAttendees)
      }
    })
  }

  // Avatar size: w-6 h-6 (24px) — button matches exactly
  const AVATAR_SIZE = 'w-6 h-6'

  return (
    <div className={`flex items-center${isPending ? ' opacity-60' : ''}`}>
      {/* All attendees as overlapping avatars */}
      {attendees.map((a, i) => (
        <div
          key={a.userId}
          style={{ marginLeft: i === 0 ? 0 : '-6px', zIndex: attendees.length - i }}
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

      {/* + button: only shown when NOT going. Hidden when going (avatar replaces it) */}
      {!isGoing && (
        <button
          onClick={handleClick}
          disabled={isPending}
          style={{ marginLeft: attendees.length > 0 ? '-6px' : 0, zIndex: 0 }}
          className={`${AVATAR_SIZE} rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--surface)] transition-all bg-[var(--subtle)] text-[var(--muted)] hover:bg-white hover:text-black`}
        >
          +
        </button>
      )}

      {/* When going: tapping any avatar removes attendance */}
      {isGoing && (
        <button
          onClick={handleClick}
          disabled={isPending}
          className="sr-only"
          aria-label="Verwijder aanwezigheid"
        />
      )}
    </div>
  )
}
