import { Suspense } from "react";
import { Search, Film, Star, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  searchMovies,
  getNowPlaying,
  getPosterUrl,
  formatReleaseYear,
  formatVoteAverage,
  type TMDbMovie,
} from "@/lib/tmdb";

export const metadata = {
  title: "Films",
  description: "Zoek films en bekijk wat er nu draait in de bioscoop",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Films</h1>
        <SearchForm initialQuery={query} />
      </header>

      <Suspense fallback={<MovieGridSkeleton />}>
        {query ? (
          <SearchResults query={query} page={page} />
        ) : (
          <NowPlayingSection page={page} />
        )}
      </Suspense>
    </main>
  );
}

function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form action="/movies" method="get">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="search"
          name="q"
          placeholder="Zoek films..."
          defaultValue={initialQuery}
          className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/50 transition-colors"
        />
      </div>
    </form>
  );
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  const data = await searchMovies(query, page);

  if (data.results.length === 0) {
    return (
      <EmptyState
        title="Geen films gevonden"
        description={`Geen resultaten voor "${query}"`}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Resultaten voor &ldquo;{query}&rdquo;
        </h2>
        <span className="text-sm text-gray-500">
          {data.total_results} films
        </span>
      </div>
      <MovieGrid movies={data.results} />
      <Pagination
        currentPage={data.page}
        totalPages={data.total_pages}
        baseUrl={`/movies?q=${encodeURIComponent(query)}`}
      />
    </section>
  );
}

async function NowPlayingSection({ page }: { page: number }) {
  const data = await getNowPlaying(page);

  if (data.results.length === 0) {
    return (
      <EmptyState
        title="Geen films beschikbaar"
        description="Er zijn momenteel geen films in de bioscoop"
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h2 className="text-lg font-semibold text-white">Nu in de bioscoop</h2>
      </div>
      <MovieGrid movies={data.results} />
      <Pagination
        currentPage={data.page}
        totalPages={Math.min(data.total_pages, 10)}
        baseUrl="/movies"
      />
    </section>
  );
}

function MovieGrid({ movies }: { movies: TMDbMovie[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

function MovieCard({ movie }: { movie: TMDbMovie }) {
  const posterUrl = getPosterUrl(movie.poster_path, "w342");

  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <article className="space-y-2">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-elevated border border-white/10 group-hover:border-brand-600/50 transition-colors">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-12 h-12 text-gray-600" />
            </div>
          )}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium text-white">
                {formatVoteAverage(movie.vote_average)}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <h3 className="font-medium text-white text-sm truncate group-hover:text-brand-500 transition-colors">
            {movie.title}
          </h3>
          {movie.release_date && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatReleaseYear(movie.release_date)}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  const separator = baseUrl.includes("?") ? "&" : "?";

  return (
    <nav className="flex items-center justify-center gap-2 pt-4">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}${separator}page=${currentPage - 1}`}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-surface-elevated border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          Vorige
        </Link>
      )}
      <span className="text-sm text-gray-500">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}${separator}page=${currentPage + 1}`}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-surface-elevated border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          Volgende
        </Link>
      )}
    </nav>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto">
        <Film className="w-8 h-8 text-gray-600" />
      </div>
      <div>
        <p className="text-gray-400 font-medium">{title}</p>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="aspect-[2/3] rounded-xl bg-surface-elevated" />
          <div className="h-4 bg-surface-elevated rounded w-3/4" />
          <div className="h-3 bg-surface-elevated rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
