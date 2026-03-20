import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, Calendar, Users, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getMovieWithCredits,
  getPosterUrl,
  getBackdropUrl,
  getProfileUrl,
  formatRuntime,
  formatReleaseYear,
  formatVoteAverage,
} from "@/lib/tmdb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    return { title: "Film niet gevonden" };
  }

  try {
    const { movie } = await getMovieWithCredits(movieId);
    return {
      title: movie.title,
      description: movie.overview || `Details over ${movie.title}`,
    };
  } catch {
    return { title: "Film niet gevonden" };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    notFound();
  }

  let movie, credits;
  try {
    const data = await getMovieWithCredits(movieId);
    movie = data.movie;
    credits = data.credits;
  } catch {
    notFound();
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path, "w500");
  const director = credits.crew.find((c) => c.job === "Director");
  const topCast = credits.cast.slice(0, 8);

  return (
    <main className="min-h-screen">
      {backdropUrl && (
        <div className="relative h-56 sm:h-72 -mx-0">
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className={`${backdropUrl ? "-mt-32 relative z-10" : "pt-6"} space-y-6`}
        >
          <nav>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar films
            </Link>
          </nav>

          <div className="flex gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-28 sm:w-36">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-elevated border border-white/10 shadow-xl">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    sizes="144px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-gray-400 italic mt-1">{movie.tagline}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <span className="font-semibold">
                      {formatVoteAverage(movie.vote_average)}
                    </span>
                    <span className="text-gray-500">
                      ({movie.vote_count.toLocaleString()})
                    </span>
                  </span>
                )}
                {movie.release_date && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatReleaseYear(movie.release_date)}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatRuntime(movie.runtime)}
                  </span>
                )}
              </div>

              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 rounded-full text-gray-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/plans/new?movieId=${movie.id}&movieTitle=${encodeURIComponent(movie.title)}&posterPath=${encodeURIComponent(movie.poster_path || "")}`}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-full transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Plan deze film
              </Link>
            </div>
          </div>

          {movie.overview && (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Samenvatting</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </section>
          )}

          {director && (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Regisseur</h2>
              <p className="text-gray-300">{director.name}</p>
            </section>
          )}

          {topCast.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topCast.map((actor) => (
                  <CastCard key={actor.id} actor={actor} />
                ))}
              </div>
            </section>
          )}

          <section className="pt-4 border-t border-white/10">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {movie.original_title !== movie.title && (
                <div>
                  <dt className="text-gray-500">Originele titel</dt>
                  <dd className="text-gray-300">{movie.original_title}</dd>
                </div>
              )}
              {movie.release_date && (
                <div>
                  <dt className="text-gray-500">Releasedatum</dt>
                  <dd className="text-gray-300">
                    {new Date(movie.release_date).toLocaleDateString("nl-NL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
              {movie.spoken_languages.length > 0 && (
                <div>
                  <dt className="text-gray-500">Talen</dt>
                  <dd className="text-gray-300">
                    {movie.spoken_languages
                      .map((l) => l.english_name)
                      .join(", ")}
                  </dd>
                </div>
              )}
              {movie.status && (
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-gray-300">{movie.status}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}

function CastCard({
  actor,
}: {
  actor: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  };
}) {
  const profileUrl = getProfileUrl(actor.profile_path, "w185");

  return (
    <div className="flex items-center gap-3 bg-surface-elevated border border-white/10 rounded-xl p-2">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={actor.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">
            👤
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{actor.name}</p>
        <p className="text-xs text-gray-500 truncate">{actor.character}</p>
      </div>
    </div>
  );
}
