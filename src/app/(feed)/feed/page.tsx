export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getRotterdamScreenings, flattenScreenings, FlatScreening } from "@/lib/screenings";
import { searchMovies } from "@/lib/tmdb";
import { AttendeeInfo } from "@/app/actions/attendance";
import ScreeningCard from "@/components/ScreeningCard";
import DayNav from "@/components/DayNav";
import BottomNav from "@/components/BottomNav";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

type AttendanceRow = {
  user_id: string;
  movie_slug: string;
  cinema_slug: string;
  showtime: string;
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const selectedDay = searchParams.day ?? todayStr();

  let user: { id: string; user_metadata?: Record<string, string> } | null = null;
  let userProfile: { firstName?: string; lastName?: string; avatarUrl?: string } = {};
  let screenings: FlatScreening[] = [];
  const tmdbMap = new Map<string, { posterPath: string | null; overview: string }>();
  const attendeesMap = new Map<string, AttendeeInfo[]>();

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        userProfile = {
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
        };
      } else {
        // Auto-create profile from auth metadata on first login
        const nameParts = (user.user_metadata?.full_name || user.user_metadata?.name || (user as { email?: string }).email?.split('@')[0] || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        await supabase.from('profiles').upsert({ id: user.id, first_name: firstName, last_name: lastName });
        userProfile = { firstName, lastName };
      }
    }

    // 1. Fetch & flatten all screenings, filter by selected day
    const raw = await getRotterdamScreenings();
    const flat = flattenScreenings(raw, new Date(0));
    screenings = flat.filter((s) => s.datetime.startsWith(selectedDay));

    // 2. Fetch TMDB in parallel, deduplicated by movieSlug
    const uniqueSlugs = [...new Set(screenings.map((s) => s.movieSlug))];
    const titleBySlug = new Map(screenings.map((s) => [s.movieSlug, s.movieTitle]));

    await Promise.all(
      uniqueSlugs.map(async (slug) => {
        try {
          const results = await searchMovies(titleBySlug.get(slug) ?? slug);
          const first = results[0];
          tmdbMap.set(slug, {
            posterPath: first?.poster_path ?? null,
            overview: first?.overview ? first.overview.slice(0, 120) : "",
          });
        } catch {
          tmdbMap.set(slug, { posterPath: null, overview: "" });
        }
      })
    );

    // 3. Fetch attendances — two queries to avoid RLS issues with JOIN
    if (user) {
      const { data: attendanceRows } = await supabase
        .from("attendances")
        .select("user_id, movie_slug, cinema_slug, showtime")
        .eq("visibility", "public");

      const rows = (attendanceRows ?? []) as AttendanceRow[];
      const uniqueUserIds = [...new Set(rows.map((r) => r.user_id))];
      const { data: profileRows } = uniqueUserIds.length > 0
        ? await supabase.from("profiles").select("id, first_name, last_name, avatar_url").in("id", uniqueUserIds)
        : { data: [] };

      const profileMap = new Map((profileRows ?? []).map((p: { id: string; first_name?: string; last_name?: string; avatar_url?: string }) => [p.id, p]));

      for (const row of rows) {
        const p = profileMap.get(row.user_id);
        // Supabase returns showtime normalized to UTC — use as-is for key
        // Normalize showtime to UTC ISO so it matches the key used below
        const normalizedShowtime = new Date(row.showtime).toISOString();
        const key = `${row.movie_slug}|${row.cinema_slug}|${normalizedShowtime}`;
        if (!attendeesMap.has(key)) attendeesMap.set(key, []);
        attendeesMap.get(key)!.push({
          userId: row.user_id,
          firstName: p?.first_name,
          lastName: p?.last_name,
          avatarUrl: p?.avatar_url,
        });
      }
    }
  } catch {
    // Build safety: return empty state when env vars unavailable
  }

  return (
    <main
      className="min-h-screen pb-28"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "rgba(8,8,17,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-md mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-1">
            <span
              className="font-display font-black text-2xl tracking-tight"
              style={{ color: "var(--text)" }}
            >
              🎬 CineSync
            </span>
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-md)",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
          </div>
        </div>
        <div className="max-w-md mx-auto">
          <DayNav currentDay={selectedDay} />
        </div>
      </header>

      {/* Feed */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {screenings.length === 0 ? (
          <div
            className="text-center py-24 px-6"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <h2
              className="font-display font-bold text-xl mb-2"
              style={{ color: "var(--text)" }}
            >
              Geen voorstellingen gevonden
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Probeer een andere dag.
            </p>
          </div>
        ) : (
          screenings.map((screening) => {
            const tmdb = tmdbMap.get(screening.movieSlug);
            const normalizedDatetime = new Date(screening.datetime).toISOString();
            const key = `${screening.movieSlug}|${screening.cinemaSlug}|${normalizedDatetime}`;
            const attendees = attendeesMap.get(key) ?? [];
            const isGoing = user ? attendees.some((a) => a.userId === user!.id) : false;

            return (
              <ScreeningCard
                key={screening.id}
                movieTitle={screening.movieTitle}
                movieSlug={screening.movieSlug}
                cinema={screening.cinema}
                cinemaSlug={screening.cinemaSlug}
                showtime={screening.datetime}
                ticketUrl={screening.ticketUrl}
                posterPath={tmdb?.posterPath ?? null}
                overview={tmdb?.overview}
                initialIsGoing={isGoing}
                initialAttendees={attendees}
                userId={user?.id}
                currentUserFirstName={userProfile.firstName}
                currentUserLastName={userProfile.lastName}
                currentUserAvatarUrl={userProfile.avatarUrl}
              />
            );
          })
        )}
      </div>

      <BottomNav active="feed" />
    </main>
  );
}
