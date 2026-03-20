const GOOGLE_PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_PLACES_API_KEY environment variable is not set");
  }
  return key;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Cinema {
  placeId: string;
  name: string;
  address: string;
  location: Coordinates;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  photoReference?: string;
  distance?: number;
}

export interface CinemaDetails extends Cinema {
  formattedPhone?: string;
  internationalPhone?: string;
  website?: string;
  openingHours?: {
    weekdayText: string[];
    openNow: boolean;
  };
  reviews?: {
    authorName: string;
    rating: number;
    text: string;
    relativeTimeDescription: string;
  }[];
}

export interface Showtime {
  id: string;
  cinemaId: string;
  movieId: number;
  movieTitle: string;
  startTime: string;
  endTime: string;
  format: ShowtimeFormat;
  language: ShowtimeLanguage;
  screenName: string;
  availableSeats: number;
  totalSeats: number;
  priceCategory: PriceCategory;
  bookingUrl?: string;
}

export type ShowtimeFormat = "2D" | "3D" | "IMAX" | "IMAX3D" | "4DX" | "Dolby Cinema" | "ScreenX";
export type ShowtimeLanguage = "OV" | "NL" | "OV+NL" | "EN";
export type PriceCategory = "standard" | "premium" | "luxury";

export interface ShowtimeFilter {
  cinemaId?: string;
  movieId?: number;
  date?: string;
  formats?: ShowtimeFormat[];
  languages?: ShowtimeLanguage[];
}

// ─────────────────────────────────────────────
// GOOGLE PLACES API
// ─────────────────────────────────────────────

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: {
    photo_reference: string;
    width: number;
    height: number;
  }[];
}

interface GoogleNearbySearchResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

interface GooglePlaceDetailsResponse {
  result: GooglePlaceResult & {
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    opening_hours?: {
      weekday_text?: string[];
      open_now?: boolean;
    };
    reviews?: {
      author_name: string;
      rating: number;
      text: string;
      relative_time_description: string;
    }[];
  };
  status: string;
  error_message?: string;
}

interface GoogleTextSearchResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function mapPlaceToCinema(
  place: GooglePlaceResult,
  userLocation?: Coordinates
): Cinema {
  const cinema: Cinema = {
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address || "",
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    openNow: place.opening_hours?.open_now,
    photoReference: place.photos?.[0]?.photo_reference,
  };

  if (userLocation) {
    cinema.distance = calculateDistance(userLocation, cinema.location);
  }

  return cinema;
}

export async function searchCinemasNearby(
  location: Coordinates,
  radiusMeters = 10000
): Promise<Cinema[]> {
  const url = new URL(`${GOOGLE_PLACES_BASE}/nearbysearch/json`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("location", `${location.lat},${location.lng}`);
  url.searchParams.set("radius", String(radiusMeters));
  url.searchParams.set("type", "movie_theater");
  url.searchParams.set("language", "nl");

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data: GoogleNearbySearchResponse = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
    );
  }

  return data.results
    .map((place) => mapPlaceToCinema(place, location))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

export async function searchCinemasByQuery(
  query: string,
  location?: Coordinates
): Promise<Cinema[]> {
  const url = new URL(`${GOOGLE_PLACES_BASE}/textsearch/json`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("query", `${query} bioscoop cinema`);
  url.searchParams.set("type", "movie_theater");
  url.searchParams.set("language", "nl");

  if (location) {
    url.searchParams.set("location", `${location.lat},${location.lng}`);
    url.searchParams.set("radius", "50000");
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data: GoogleTextSearchResponse = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
    );
  }

  return data.results
    .map((place) => mapPlaceToCinema(place, location))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

export async function getCinemaDetails(placeId: string): Promise<CinemaDetails> {
  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "geometry",
    "rating",
    "user_ratings_total",
    "opening_hours",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "photos",
    "reviews",
  ].join(",");

  const url = new URL(`${GOOGLE_PLACES_BASE}/details/json`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", fields);
  url.searchParams.set("language", "nl");

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data: GooglePlaceDetailsResponse = await response.json();

  if (data.status !== "OK") {
    throw new Error(
      `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
    );
  }

  const place = data.result;

  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address || "",
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    openNow: place.opening_hours?.open_now,
    photoReference: place.photos?.[0]?.photo_reference,
    formattedPhone: place.formatted_phone_number,
    internationalPhone: place.international_phone_number,
    website: place.website,
    openingHours: place.opening_hours
      ? {
          weekdayText: place.opening_hours.weekday_text || [],
          openNow: place.opening_hours.open_now || false,
        }
      : undefined,
    reviews: place.reviews?.map((review) => ({
      authorName: review.author_name,
      rating: review.rating,
      text: review.text,
      relativeTimeDescription: review.relative_time_description,
    })),
  };
}

export function getCinemaPhotoUrl(
  photoReference: string,
  maxWidth = 400
): string {
  const url = new URL(`${GOOGLE_PLACES_BASE}/photo`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("photoreference", photoReference);
  url.searchParams.set("maxwidth", String(maxWidth));
  return url.toString();
}

// ─────────────────────────────────────────────
// MOCK SHOWTIME DATA
// ─────────────────────────────────────────────

const SCREEN_NAMES = ["Zaal 1", "Zaal 2", "Zaal 3", "IMAX", "Dolby Cinema", "4DX", "ScreenX"];

const FORMATS_BY_SCREEN: Record<string, ShowtimeFormat[]> = {
  "Zaal 1": ["2D", "3D"],
  "Zaal 2": ["2D", "3D"],
  "Zaal 3": ["2D"],
  "IMAX": ["IMAX", "IMAX3D"],
  "Dolby Cinema": ["Dolby Cinema"],
  "4DX": ["4DX"],
  "ScreenX": ["ScreenX"],
};

const PRICE_BY_FORMAT: Record<ShowtimeFormat, PriceCategory> = {
  "2D": "standard",
  "3D": "standard",
  "IMAX": "premium",
  "IMAX3D": "premium",
  "4DX": "luxury",
  "Dolby Cinema": "luxury",
  "ScreenX": "premium",
};

function generateShowtimeId(
  cinemaId: string,
  movieId: number,
  date: string,
  time: string
): string {
  return `${cinemaId}-${movieId}-${date}-${time}`.replace(/[^a-zA-Z0-9-]/g, "");
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMockShowtimes(
  cinemaId: string,
  movieId: number,
  movieTitle: string,
  date: string,
  runtimeMinutes: number
): Showtime[] {
  const showtimes: Showtime[] = [];
  const startTimes = ["10:30", "13:15", "15:45", "18:00", "20:30", "22:45"];
  const languages: ShowtimeLanguage[] = ["OV", "NL", "OV+NL"];

  const numScreens = Math.floor(Math.random() * 3) + 1;
  const selectedScreens = SCREEN_NAMES.slice(0, numScreens);

  for (const screenName of selectedScreens) {
    const possibleFormats = FORMATS_BY_SCREEN[screenName] || ["2D"];
    const format = getRandomElement(possibleFormats);
    const screenTimes = startTimes.filter(() => Math.random() > 0.4);

    for (const startTime of screenTimes) {
      const endTime = addMinutes(startTime, runtimeMinutes + 20);
      const totalSeats = screenName.includes("IMAX") ? 400 : screenName.includes("Dolby") ? 200 : 150;
      const availableSeats = Math.floor(Math.random() * totalSeats * 0.7) + Math.floor(totalSeats * 0.1);

      showtimes.push({
        id: generateShowtimeId(cinemaId, movieId, date, startTime),
        cinemaId,
        movieId,
        movieTitle,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        format,
        language: getRandomElement(languages),
        screenName,
        availableSeats,
        totalSeats,
        priceCategory: PRICE_BY_FORMAT[format],
        bookingUrl: `https://booking.example.com/${cinemaId}/${movieId}/${date}/${startTime}`,
      });
    }
  }

  return showtimes.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getShowtimes(
  cinemaId: string,
  movieId: number,
  movieTitle: string,
  date: string,
  runtimeMinutes = 120
): Promise<Showtime[]> {
  return generateMockShowtimes(cinemaId, movieId, movieTitle, date, runtimeMinutes);
}

export async function getShowtimesByCinema(
  cinemaId: string,
  date: string,
  movies: { id: number; title: string; runtime: number }[]
): Promise<Showtime[]> {
  const allShowtimes: Showtime[] = [];

  for (const movie of movies) {
    const showtimes = generateMockShowtimes(
      cinemaId,
      movie.id,
      movie.title,
      date,
      movie.runtime
    );
    allShowtimes.push(...showtimes);
  }

  return allShowtimes.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getShowtimesByMovie(
  movieId: number,
  movieTitle: string,
  date: string,
  cinemaIds: string[],
  runtimeMinutes = 120
): Promise<Showtime[]> {
  const allShowtimes: Showtime[] = [];

  for (const cinemaId of cinemaIds) {
    const showtimes = generateMockShowtimes(
      cinemaId,
      movieId,
      movieTitle,
      date,
      runtimeMinutes
    );
    allShowtimes.push(...showtimes);
  }

  return allShowtimes.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function filterShowtimes(
  showtimes: Showtime[],
  filter: ShowtimeFilter
): Showtime[] {
  return showtimes.filter((showtime) => {
    if (filter.cinemaId && showtime.cinemaId !== filter.cinemaId) {
      return false;
    }
    if (filter.movieId && showtime.movieId !== filter.movieId) {
      return false;
    }
    if (filter.date && !showtime.startTime.startsWith(filter.date)) {
      return false;
    }
    if (filter.formats && filter.formats.length > 0 && !filter.formats.includes(showtime.format)) {
      return false;
    }
    if (filter.languages && filter.languages.length > 0 && !filter.languages.includes(showtime.language)) {
      return false;
    }
    return true;
  });
}

// ─────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatShowtime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShowtimeDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getAvailabilityLabel(available: number, total: number): string {
  const percentage = (available / total) * 100;
  if (percentage === 0) return "Uitverkocht";
  if (percentage < 20) return "Bijna vol";
  if (percentage < 50) return "Beperkt beschikbaar";
  return "Beschikbaar";
}

export function getAvailabilityColor(available: number, total: number): string {
  const percentage = (available / total) * 100;
  if (percentage === 0) return "text-red-500";
  if (percentage < 20) return "text-orange-500";
  if (percentage < 50) return "text-yellow-500";
  return "text-green-500";
}

export function formatPriceCategory(category: PriceCategory): string {
  const labels: Record<PriceCategory, string> = {
    standard: "Standaard",
    premium: "Premium",
    luxury: "Luxe",
  };
  return labels[category];
}

export function formatLanguage(language: ShowtimeLanguage): string {
  const labels: Record<ShowtimeLanguage, string> = {
    OV: "Originele versie",
    NL: "Nederlands gesproken",
    "OV+NL": "OV met NL ondertiteling",
    EN: "Engels",
  };
  return labels[language];
}

export function formatLanguageShort(language: ShowtimeLanguage): string {
  const labels: Record<ShowtimeLanguage, string> = {
    OV: "OV",
    NL: "NL",
    "OV+NL": "OV/NL",
    EN: "EN",
  };
  return labels[language];
}
