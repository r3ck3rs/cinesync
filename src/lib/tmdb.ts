const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }
  return key;
}

export interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
}

export interface TMDbMovieDetails extends Omit<TMDbMovie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  spoken_languages: { iso_639_1: string; name: string; english_name: string }[];
  imdb_id: string | null;
}

export interface TMDbCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TMDbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

type ImageSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";
type BackdropSize = "w300" | "w780" | "w1280" | "original";

export function getPosterUrl(
  path: string | null,
  size: ImageSize = "w342"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: BackdropSize = "w1280"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(
  path: string | null,
  size: ImageSize = "w185"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_API_BASE}${endpoint}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "nl-NL");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `TMDb API error: ${response.status} ${error.status_message || response.statusText}`
    );
  }

  return response.json();
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDbResponse<TMDbMovie>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  return tmdbFetch<TMDbResponse<TMDbMovie>>("/search/movie", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
}

export async function getNowPlaying(
  page = 1,
  region = "NL"
): Promise<TMDbResponse<TMDbMovie>> {
  return tmdbFetch<TMDbResponse<TMDbMovie>>("/movie/now_playing", {
    page: String(page),
    region,
  });
}

export async function getPopularMovies(
  page = 1
): Promise<TMDbResponse<TMDbMovie>> {
  return tmdbFetch<TMDbResponse<TMDbMovie>>("/movie/popular", {
    page: String(page),
  });
}

export async function getUpcomingMovies(
  page = 1,
  region = "NL"
): Promise<TMDbResponse<TMDbMovie>> {
  return tmdbFetch<TMDbResponse<TMDbMovie>>("/movie/upcoming", {
    page: String(page),
    region,
  });
}

export async function getMovieDetails(id: number): Promise<TMDbMovieDetails> {
  return tmdbFetch<TMDbMovieDetails>(`/movie/${id}`);
}

export async function getMovieCredits(id: number): Promise<TMDbCredits> {
  return tmdbFetch<TMDbCredits>(`/movie/${id}/credits`);
}

export async function getMovieWithCredits(id: number): Promise<{
  movie: TMDbMovieDetails;
  credits: TMDbCredits;
}> {
  const [movie, credits] = await Promise.all([
    getMovieDetails(id),
    getMovieCredits(id),
  ]);
  return { movie, credits };
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}u`;
  return `${hours}u ${mins}m`;
}

export function formatReleaseYear(date: string | null): string {
  if (!date) return "";
  return date.split("-")[0];
}

export function formatVoteAverage(vote: number): string {
  return vote.toFixed(1);
}
