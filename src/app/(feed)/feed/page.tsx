export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getRotterdamScreenings, flattenScreenings, FlatScreening } from "@/lib/screenings";
import { searchMovies } from "@/lib/tmdb";
import { AttendeeInfo } from "@/app/actions/attendance";
import ScreeningCard from "@/components/ScreeningCard";
import DayNav from "@/components/DayNav";

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
    <main className="min-h-screen bg-black text-white pb-24">
      {/* Header + Day nav */}
      <div className="sticky top-0 bg-black/90 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 border-b border-gray-900">
          <h1 className="text-xl font-bold">🎬 CineSync</h1>
        </div>
        <div className="max-w-2xl mx-auto">
          <DayNav currentDay={selectedDay} />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {screenings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <h2 className="text-xl font-semibold mb-2">Geen voorstellingen gevonden</h2>
            <p className="text-gray-400">Probeer een andere dag.</p>
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

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-gray-900 px-6 py-3 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <Link href="/feed" className="flex flex-col items-center gap-1 text-purple-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Feed</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"
          >
            <span className="text-xl">🎟️</span>
            <span className="text-xs">Plans</span>
          </Link>
          <span className="flex flex-col items-center gap-1 text-gray-700 cursor-not-allowed">
            <span className="text-xl">👥</span>
            <span className="text-xs">Vrienden</span>
          </span>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs">Profiel</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
