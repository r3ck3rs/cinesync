import Image from "next/image";
import Link from "next/link";
import { getMovieDetails, searchMovies, getPosterUrl, getDirector, formatRuntime, getReleaseYear } from "@/lib/tmdb";
import BottomNav from "@/components/BottomNav";

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
      <main
        className="min-h-screen pb-28"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <div className="max-w-md mx-auto px-4 py-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </Link>
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Film niet gevonden</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Probeer een ander moment opnieuw.</p>
          </div>
        </div>
        <BottomNav active="feed" />
      </main>
    );
  }

  const director = getDirector(movie.credits.crew);
  const topCast = movie.credits.cast.slice(0, 5);

  return (
    <main
      className="min-h-screen pb-28"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Sticky back header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "rgba(8,8,17,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </Link>
          <span
            className="font-display font-bold text-sm"
            style={{ color: "var(--muted)" }}
          >
            Film
          </span>
          <div className="w-14" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Hero: Poster + Title */}
        <div
          className="flex gap-5 mb-6 p-4 rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {movie.poster_path ? (
            <Image
              src={getPosterUrl(movie.poster_path, "w342")}
              alt={movie.title}
              width={110}
              height={165}
              className="rounded-xl object-cover flex-shrink-0"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            />
          ) : (
            <div
              className="flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{
                width: 110,
                height: 165,
                background: "linear-gradient(135deg, var(--elevated), var(--overlay))",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h1
                className="font-display font-bold text-xl leading-tight mb-2"
                style={{ color: "var(--text)" }}
              >
                {movie.title}
              </h1>
              <div className="flex flex-wrap gap-1 mb-3">
                {movie.genres.slice(0, 3).map((g) => (
                  <span
                    key={g.name}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(124,111,247,0.12)",
                      color: "var(--muted)",
                      border: "1px solid rgba(124,111,247,0.2)",
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {getReleaseYear(movie.release_date)}
                {movie.runtime > 0 && (
                  <> · {formatRuntime(movie.runtime)}</>
                )}
              </p>
            </div>

            {/* Rating */}
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5c518" stroke="#f5c518" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="font-display font-bold text-base" style={{ color: "#f5c518" }}>
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>/ 10</span>
              </div>
            )}
          </div>
        </div>

        {/* Synopsis */}
        {movie.overview && (
          <section className="mb-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              Synopsis
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(240,240,248,0.75)" }}
            >
              {movie.overview}
            </p>
          </section>
        )}

        {/* Director */}
        {director && (
          <section className="mb-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              Regisseur
            </h2>
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "rgba(124,111,247,0.15)", color: "var(--muted)" }}
              >
                {director[0]}
              </div>
              <span className="text-sm font-medium">{director}</span>
            </div>
          </section>
        )}

        {/* Cast */}
        {topCast.length > 0 && (
          <section className="mb-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              Cast
            </h2>
            <div className="space-y-2">
              {topCast.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "var(--elevated)",
                      color: "var(--muted)",
                    }}
                  >
                    {actor.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{actor.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Production */}
        {movie.production_companies.length > 0 && (
          <section className="mb-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              Productie
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {movie.production_companies.map((c) => c.name).join(", ")}
            </p>
          </section>
        )}
      </div>

      <BottomNav active="feed" />
    </main>
  );
}
