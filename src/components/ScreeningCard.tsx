'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toggleAttendance, AttendeeInfo } from '@/app/actions/attendance'
import AvatarStack from './AvatarStack'
import { getPosterUrl } from '@/lib/tmdb'

interface ScreeningCardProps {
  movieTitle: string
  movieSlug: string
  cinema: string
  cinemaSlug: string
  showtime: string
  ticketUrl?: string
  posterPath?: string | null
  overview?: string
  initialIsGoing: boolean
  initialAttendees: AttendeeInfo[]
  userId?: string
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

export default function ScreeningCard({
  movieTitle,
  movieSlug,
  cinema,
  cinemaSlug,
  showtime,
  ticketUrl,
  posterPath,
  overview,
  initialIsGoing,
  initialAttendees,
  userId,
}: ScreeningCardProps) {
  const [isGoing, setIsGoing] = useState(initialIsGoing)
  const [attendees, setAttendees] = useState(initialAttendees)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

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
          moviePosterPath: posterPath ?? undefined,
          cinema,
          cinemaSlug,
          showtime,
          ticketUrl,
        })
        setIsGoing(result.attending)
        setAttendees(result.attendees)
      } catch {
        setIsGoing(initialIsGoing)
        setAttendees(initialAttendees)
      }
    })
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex gap-4">
      {/* Poster */}
      {posterPath ? (
        <Image
          src={getPosterUrl(posterPath, 'w185')}
          alt={movieTitle}
          width={64}
          height={96}
          className="rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🎬</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-semibold text-base leading-tight mb-0.5">{movieTitle}</h3>
        <p className="text-sm text-gray-400 mb-1">{cinema} • {formatTime(showtime)}</p>
        {overview && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{overview}</p>
        )}

        {/* Avatar row + join button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            {attendees.length > 0 && <AvatarStack attendees={attendees} max={4} />}
          </div>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors flex-shrink-0 ${
              isGoing
                ? 'bg-purple-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-500'
            } ${isPending ? 'opacity-60' : ''}`}
          >
            {isGoing ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
