'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AttendeeInfo } from '@/app/actions/attendance'
import AttendanceButton from './AttendanceButton'
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
  currentUserFirstName?: string
  currentUserLastName?: string
  currentUserAvatarUrl?: string
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
  currentUserFirstName,
  currentUserLastName,
  currentUserAvatarUrl,
}: ScreeningCardProps) {
  return (
    <Link
      href={`/film/${movieSlug}`}
      className="block group"
      style={{ textDecoration: 'none' }}
    >
      <article
        className="flex gap-3.5 p-3.5 rounded-2xl transition-all duration-200 group-hover:scale-[1.01]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Poster */}
        <div className="flex-shrink-0 relative" style={{ width: 80, height: 120 }}>
          {posterPath ? (
            <Image
              src={getPosterUrl(posterPath, 'w185')}
              alt={movieTitle}
              width={80}
              height={120}
              className="rounded-xl object-cover"
              style={{
                width: 80,
                height: 120,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div
              className="w-full h-full rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--elevated), var(--overlay))',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="2" y1="7" x2="7" y2="7"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="17" y1="17" x2="22" y2="17"/>
                <line x1="17" y1="7" x2="22" y2="7"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col py-0.5">
          {/* Title */}
          <h3
            className="font-display font-bold text-[15px] leading-snug mb-1 line-clamp-2"
            style={{ color: 'var(--text)' }}
          >
            {movieTitle}
          </h3>

          {/* Info chip: time · cinema */}
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {formatTime(showtime)}
              <span className="mx-1 opacity-40">·</span>
              {cinema}
            </span>
          </div>

          {/* Overview */}
          {overview && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mb-2"
              style={{ color: 'var(--muted)' }}
            >
              {overview}
            </p>
          )}

          {/* Footer: attendance area */}
          <div className="mt-auto flex items-center justify-end">
            <AttendanceButton
              movieSlug={movieSlug}
              movieTitle={movieTitle}
              cinema={cinema}
              cinemaSlug={cinemaSlug}
              showtime={showtime}
              ticketUrl={ticketUrl}
              moviePosterPath={posterPath ?? undefined}
              initialIsGoing={initialIsGoing}
              initialAttendees={initialAttendees}
              userId={userId}
              currentUserFirstName={currentUserFirstName}
              currentUserLastName={currentUserLastName}
              currentUserAvatarUrl={currentUserAvatarUrl}
            />
          </div>
        </div>
      </article>
    </Link>
  )
}
