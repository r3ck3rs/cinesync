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
  profiles: { first_name?: string; last_name?: string; avatar_url?: string } | null;
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const selectedDay = searchParams.day ?? todayStr();

  let user: { id: string } | null = null;
  let screenings: FlatScreening[] = [];
  const tmdbMap = new Map<string, { posterPath: string | null; overview: string }>();
  const attendeesMap = new Map<string, AttendeeInfo[]>();

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

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

    // 3. Fetch attendances
    if (user) {
      const { data } = await supabase
        .from("attendances")
        .select("user_id, movie_slug, cinema_slug, showtime, profiles(first_name, last_name, avatar_url)")
        .eq("visibility", "public");

      for (const row of (data ?? []) as AttendanceRow[]) {
        const key = `${row.movie_slug}|${row.cinema_slug}|${row.showtime}`;
        if (!attendeesMap.has(key)) attendeesMap.set(key, []);
        attendeesMap.get(key)!.push({
          userId: row.user_id,
          firstName: row.profiles?.first_name,
          lastName: row.profiles?.last_name,
          avatarUrl: row.profiles?.avatar_url,
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
              style={{
                background: "linear-gradient(135deg, #f0f0f8 0%, #9b8ef7 60%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
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
            const key = `${screening.movieSlug}|${screening.cinemaSlug}|${screening.datetime}`;
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
              />
            );
          })
        )}
      </div>

      <BottomNav active="feed" />
    </main>
  );
}
