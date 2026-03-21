'use client'

import { useRouter } from 'next/navigation'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' })
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function DayNav({ currentDay }: { currentDay: string }) {
  const router = useRouter()
  const isToday = currentDay === todayStr()

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <button
        onClick={() => router.push(`/feed?day=${addDays(currentDay, -1)}`)}
        disabled={isToday}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
        aria-label="Vorige dag"
        style={{ color: 'var(--muted)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div className="flex flex-col items-center gap-0.5">
        {isToday && (
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text)' }}
          >
            Vandaag
          </span>
        )}
        <span
          className="text-sm font-medium capitalize"
          style={{ color: isToday ? 'var(--text)' : 'var(--muted)' }}
        >
          {formatDay(currentDay)}
        </span>
      </div>

      <button
        onClick={() => router.push(`/feed?day=${addDays(currentDay, 1)}`)}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-white/5"
        aria-label="Volgende dag"
        style={{ color: 'var(--muted)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  )
}
