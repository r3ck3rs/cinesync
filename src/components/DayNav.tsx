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
    <div className="flex items-center justify-between px-6 py-2 border-t border-gray-900">
      <button
        onClick={() => router.push(`/feed?day=${addDays(currentDay, -1)}`)}
        disabled={isToday}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
        aria-label="Vorige dag"
      >
        ←
      </button>
      <span className="text-sm font-medium text-gray-200 capitalize">
        {formatDay(currentDay)}
      </span>
      <button
        onClick={() => router.push(`/feed?day=${addDays(currentDay, 1)}`)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors text-lg"
        aria-label="Volgende dag"
      >
        →
      </button>
    </div>
  )
}
