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

export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
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
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results?.slice(0, 6) ?? [];
}

export function getReleaseYear(date: string): string {
  return date ? date.slice(0, 4) : "";
}
