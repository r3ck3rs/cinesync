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
    .eq('showtime', showtime)
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
      showtime,
      ticket_url: ticketUrl,
      visibility,
    })
  }

  // Fetch updated attendee list for this screening
  const { data: attendances } = await supabase
    .from('attendances')
    .select('user_id, profiles(first_name, last_name, avatar_url)')
    .eq('movie_slug', movieSlug)
    .eq('cinema_slug', cinemaSlug)
    .eq('showtime', showtime)

  const attendees: AttendeeInfo[] = (attendances ?? []).map((a: any) => ({
    userId: a.user_id,
    firstName: a.profiles?.first_name ?? undefined,
    lastName: a.profiles?.last_name ?? undefined,
    avatarUrl: a.profiles?.avatar_url ?? undefined,
  }))

  revalidatePath('/feed')

  return {
    attending: !existing,
    attendees,
  }
}
