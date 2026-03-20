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
      setAttendees([...attendees, { userId }])
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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
        isGoing
          ? 'bg-purple-900 border-purple-600 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      <span>{formatTime(showtime)}</span>
      <span className="text-xs text-gray-400">{cinema}</span>
      {attendees.length > 0 && <AvatarStack attendees={attendees} max={3} />}
      <span>{isGoing ? '✓' : '+'}</span>
    </button>
  )
}
