'use client'

import { useState, useTransition } from 'react'
import { toggleAttendance, AttendeeInfo } from '@/app/actions/attendance'
import AvatarStack from './AvatarStack'

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

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

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

  const handleClick = () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

    // Optimistic update
    if (isGoing) {
      setIsGoing(false)
      setAttendees(attendees.filter((a) => a.userId !== userId))
    } else {
      setIsGoing(true)
      setAttendees([...attendees, {
        userId,
        firstName: currentUserFirstName,
        lastName: currentUserLastName,
        avatarUrl: currentUserAvatarUrl,
      }])
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
        setIsGoing(result.attending)
        setAttendees(result.attendees)
      } catch {
        // Revert on error
        setIsGoing(initialIsGoing)
        setAttendees(initialAttendees)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
        isPending ? 'opacity-50' : ''
      }`}
      style={
        isGoing
          ? {
              background: 'linear-gradient(135deg, rgba(124,111,247,0.2), rgba(236,72,153,0.2))',
              border: '1px solid rgba(124,111,247,0.4)',
              color: '#9b8ef7',
            }
          : {
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }
      }
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>{formatTime(showtime)}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span className="truncate max-w-[80px]">{cinema}</span>
      {attendees.length > 0 && (
        <>
          <span style={{ opacity: 0.3 }}>|</span>
          <AvatarStack attendees={attendees} max={3} />
        </>
      )}
      <span className="ml-0.5">
        {isGoing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          '+'
        )}
      </span>
    </button>
  )
}
