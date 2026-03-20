const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDbMovieDetails extends TMDbMovie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
  production_companies: Array<{ id: number; name: string }>;
}

export function getPosterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "original" = "w342"
): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function searchMovies(query: string): Promise<TMDbMovie[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=nl-NL&include_adult=false`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.slice(0, 6) ?? [];
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovieDetails | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${movieId}?language=nl-NL&append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as TMDbMovieDetails;
  } catch (err) {
    console.error("Failed to fetch movie details:", err);
    return null;
  }
}

export function getReleaseYear(date: string): string {
  return date ? date.slice(0, 4) : "";
}

export function getDirector(crew: Array<{ job: string; name: string }>): string | null {
  const director = crew.find((c) => c.job === "Director");
  return director?.name ?? null;
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}