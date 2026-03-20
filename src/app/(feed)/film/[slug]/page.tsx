import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMovieDetails, searchMovies, getPosterUrl, getDirector, formatRuntime, getReleaseYear } from "@/lib/tmdb";

interface FilmPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; title?: string }>;
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const { slug } = await params;
  const { id, title } = await searchParams;

  // If TMDb ID is passed via query param, use it directly
  let movie = null;
  if (id) {
    movie = await getMovieDetails(parseInt(id));
  }

  // Otherwise search by title
  if (!movie && title) {
    const results = await searchMovies(title);
    if (results.length > 0) {
      movie = await getMovieDetails(results[0].id);
    }
  }

  // Fallback: search by slug (reconstruct title from slug)
  if (!movie) {
    const titleFromSlug = slug.split("-").slice(0, -1).join(" ");
    const results = await searchMovies(titleFromSlug);
    if (results.length > 0) {
      movie = await getMovieDetails(results[0].id);
    }
  }

  if (!movie) {
    return (
      <main className="min-h-screen bg-black text-white pb-20">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link href="/feed" className="text-purple-400 hover:text-purple-300 mb-6 block">
            ← Terug naar feed
          </Link>
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <h2 className="text-xl font-semibold mb-2">Film niet gevonden</h2>
            <p className="text-gray-400">Probeer een ander moment opnieuw.</p>
          </div>
        </div>
      </main>
    );
  }

  const director = getDirector(movie.credits.crew);
  const topCast = movie.credits.cast.slice(0, 5);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-gray-900 px-6 py-4 z-10">
        <div className="max-w-2xl mx-auto">
          <Link href="/feed" className="text-purple-400 hover:text-purple-300">
            ← Terug
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        {/* Poster + Title */}
        <div className="mb-8">
          <div className="flex gap-6 mb-8">
            {movie.poster_path ? (
              <Image
                src={getPosterUrl(movie.poster_path, "w342")}
                alt={movie.title}
                width={140}
                height={210}
                className="rounded-xl object-cover flex-shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-[140px] h-[210px] bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">🎬</span>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold leading-tight mb-2">{movie.title}</h1>
                <p className="text-gray-400 text-sm mb-2">
                  {getReleaseYear(movie.release_date)} {movie.genres.length > 0 && `• ${movie.genres.map((g) => g.name).join(", ")}`}
                </p>
                {movie.runtime > 0 && (
                  <p className="text-gray-400 text-sm mb-3">{formatRuntime(movie.runtime)}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-yellow-400">★</span>
                <span className="text-gray-400 text-sm">/ 10</span>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          {movie.overview && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-300 mb-2 uppercase">Sinopsis</h2>
              <p className="text-gray-400 leading-relaxed text-sm">{movie.overview}</p>
            </div>
          )}

          {/* Director */}
          {director && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-300 mb-2 uppercase">Regisseur</h2>
              <p className="text-white">{director}</p>
            </div>
          )}

          {/* Cast */}
          {topCast.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase">Cast</h2>
              <div className="space-y-2">
                {topCast.map((actor) => (
                  <div key={actor.id}>
                    <p className="text-white text-sm font-medium">{actor.name}</p>
                    <p className="text-gray-400 text-xs">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production */}
          {movie.production_companies.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-300 mb-2 uppercase">Productie</h2>
              <p className="text-gray-400 text-sm">{movie.production_companies.map((c) => c.name).join(", ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-gray-900 px-6 py-3 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <Link href="/feed" className="flex flex-col items-center gap-1 text-purple-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/plans" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">🎟️</span>
            <span className="text-xs">Plans</span>
          </Link>
          <Link href="/plans/new" className="flex flex-col items-center gap-1">
            <span className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-lg transition-colors">+</span>
          </Link>
          <Link href="/friends" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">👥</span>
            <span className="text-xs">Vrienden</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-xs">Profiel</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}