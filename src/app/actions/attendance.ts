'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AttendeeInfo {
  userId: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export interface ToggleResult {
  attending: boolean
  attendees: AttendeeInfo[]
}

export async function toggleAttendance(params: {
  movieSlug: string
  movieTitle: string
  moviePosterPath?: string
  cinema: string
  cinemaSlug: string
  showtime: string // ISO string
  ticketUrl?: string
  visibility?: 'public' | 'friends'
}): Promise<ToggleResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { movieSlug, movieTitle, moviePosterPath, cinema, cinemaSlug, showtime, ticketUrl, visibility = 'public' } = params

  // Normalize showtime to UTC ISO string to avoid timezone offset mismatches
  const normalizedShowtime = new Date(showtime).toISOString()

  // Auto-create profile if missing
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    const meta = user.user_metadata || {}
    const fullName = (meta.full_name || meta.name || user.email?.split('@')[0] || '').trim()
    const parts = fullName.split(' ')
    await supabase.from('profiles').upsert({
      id: user.id,
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      avatar_url: meta.avatar_url || meta.picture || null,
    })
  }

  // Check if already attending
  const { data: existing } = await supabase
    .from('attendances')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_slug', movieSlug)
    .eq('cinema_slug', cinemaSlug)
    .eq('showtime', normalizedShowtime)
    .single()

  if (existing) {
    // Remove attendance
    await supabase.from('attendances').delete().eq('id', existing.id)
  } else {
    // Add attendance
    await supabase.from('attendances').insert({
      user_id: user.id,
      movie_slug: movieSlug,
      movie_title: movieTitle,
      movie_poster_path: moviePosterPath,
      cinema,
      cinema_slug: cinemaSlug,
      showtime: normalizedShowtime,
      ticket_url: ticketUrl,
      visibility,
    })
  }

  // Fetch updated attendee list — two queries to avoid RLS issues with JOIN
  const { data: attendanceRows } = await supabase
    .from('attendances')
    .select('user_id')
    .eq('movie_slug', movieSlug)
    .eq('cinema_slug', cinemaSlug)
    .eq('showtime', normalizedShowtime)

  const userIds = (attendanceRows ?? []).map((a: { user_id: string }) => a.user_id)
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, first_name, last_name, avatar_url').in('id', userIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p: { id: string; first_name?: string; last_name?: string; avatar_url?: string }) => [p.id, p]))

  const attendees: AttendeeInfo[] = userIds.map((uid: string) => {
    const p = profileMap.get(uid)
    return {
      userId: uid,
      firstName: p?.first_name ?? undefined,
      lastName: p?.last_name ?? undefined,
      avatarUrl: p?.avatar_url ?? undefined,
    }
  })

  revalidatePath('/feed')

  return {
    attending: !existing,
    attendees,
  }
}
