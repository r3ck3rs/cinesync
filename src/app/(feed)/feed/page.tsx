export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { getRotterdamScreenings, flattenScreenings, FlatScreening } from "@/lib/screenings";
import { searchMovies, getPosterUrl } from "@/lib/tmdb";
import { AttendeeInfo } from "@/app/actions/attendance";
import AttendanceButton from "@/components/AttendanceButton";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch screenings from scraper
  const raw = await getRotterdamScreenings();
  const flat = flattenScreenings(raw);

  // 2. Group by movieSlug
  const movieMap = new Map<
    string,
    { title: string; slug: string; showtimes: FlatScreening[] }
  >();
  for (const s of flat) {
    if (!movieMap.has(s.movieSlug)) {
      movieMap.set(s.movieSlug, {
        title: s.movieTitle,
        slug: s.movieSlug,
        showtimes: [],
      });
    }
    movieMap.get(s.movieSlug)!.showtimes.push(s);
  }

  const movies = Array.from(movieMap.values());

  // 3. Fetch TMDB posters in parallel
  const posterMap = new Map<string, string | null>();
  await Promise.all(
    movies.map(async (movie) => {
      const results = await searchMovies(movie.title);
      posterMap.set(movie.slug, results[0]?.poster_path ?? null);
    })
  );

  // 4. If logged in: fetch all public attendances with profiles
  type AttendanceRow = {
    user_id: string;
    movie_slug: string;
    cinema_slug: string;
    showtime: string;
    profiles: { first_name?: string; last_name?: string; avatar_url?: string } | null;
  };

  let attendanceRows: AttendanceRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("attendances")
      .select("user_id, movie_slug, cinema_slug, showtime, profiles(first_name, last_name, avatar_url)")
      .eq("visibility", "public");
    attendanceRows = (data ?? []) as AttendanceRow[];
  }

  // Build a lookup: `${movieSlug}|${cinemaSlug}|${showtime}` -> AttendeeInfo[]
  const attendeesMap = new Map<string, AttendeeInfo[]>();
  for (const row of attendanceRows) {
    const key = `${row.movie_slug}|${row.cinema_slug}|${row.showtime}`;
    if (!attendeesMap.has(key)) attendeesMap.set(key, []);
    attendeesMap.get(key)!.push({
      userId: row.user_id,
      firstName: row.profiles?.first_name,
      lastName: row.profiles?.last_name,
      avatarUrl: row.profiles?.avatar_url,
    });
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-gray-900 px-6 py-4 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">🎬 CineSync</h1>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <h2 className="text-xl font-semibold mb-2">Geen voorstellingen gevonden</h2>
            <p className="text-gray-400">Probeer het later opnieuw.</p>
          </div>
        ) : (
          movies.map((movie) => {
            const posterPath = posterMap.get(movie.slug) ?? null;
            return (
              <div
                key={movie.slug}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex gap-4"
              >
                {/* Poster */}
                {posterPath ? (
                  <Image
                    src={getPosterUrl(posterPath, "w185")}
                    alt={movie.title}
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight mb-3">
                    {movie.title}
                  </h3>

                  {/* Showtime chips */}
                  <div className="flex flex-wrap gap-2">
                    {movie.showtimes.map((screening) => {
                      const key = `${screening.movieSlug}|${screening.cinemaSlug}|${screening.datetime}`;
                      const attendees = attendeesMap.get(key) ?? [];
                      const isGoing = user
                        ? attendees.some((a) => a.userId === user.id)
                        : false;
                      return (
                        <AttendanceButton
                          key={screening.id}
                          movieSlug={screening.movieSlug}
                          movieTitle={screening.movieTitle}
                          moviePosterPath={posterPath ?? undefined}
                          cinema={screening.cinema}
                          cinemaSlug={screening.cinemaSlug}
                          showtime={screening.datetime}
                          ticketUrl={screening.ticketUrl}
                          initialIsGoing={isGoing}
                          initialAttendees={attendees}
                          userId={user?.id}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
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
