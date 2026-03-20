/**
 * Cinema scraper for Rotterdam — sources filmladder.nl
 * Parses schema.org structured data (itemprop="startDate") from HTML.
 */

import * as cheerio from "cheerio";

export interface Showtime {
  datetime: string; // ISO 8601 e.g. "2026-03-20T20:00:00+01:00"
  ticketUrl: string;
}

export interface Screening {
  id: string; // unique: `${cinemaSlug}|${movieSlug}|${datetime}`
  cinema: string;
  cinemaSlug: string;
  movieTitle: string;
  movieSlug: string;
  showtimes: Showtime[];
}

const FILMLADDER_URL = "https://www.filmladder.nl/rotterdam";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cache: { data: Screening[]; fetchedAt: number } | null = null;

export async function getRotterdamScreenings(): Promise<Screening[]> {
  // Return cache if still fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const html = await fetchFilmladder();
  const screenings = parseScreenings(html);

  cache = { data: screenings, fetchedAt: Date.now() };
  return screenings;
}

async function fetchFilmladder(): Promise<string> {
  const res = await fetch(FILMLADDER_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "nl-NL,nl;q=0.9",
    },
    next: { revalidate: 1800 }, // Next.js cache: 30 min
  });

  if (!res.ok) {
    throw new Error(`Filmladder fetch failed: ${res.status}`);
  }

  return res.text();
}

export function parseScreenings(html: string): Screening[] {
  const $ = cheerio.load(html);
  const screenings: Screening[] = [];

  // Each cinema block has an anchor like id="cinerama-rotterdam" followed by
  // a div.cinema containing div.cinema-name > a.cinema-link (cinema name)
  // and multiple div.hall blocks (one per movie).

  let currentCinema = "";
  let currentCinemaSlug = "";

  // Walk through all relevant elements in document order
  $("[id$='-rotterdam'], div.cinema-name, div.hall").each((_, el) => {
    const elem = $(el);

    // Anchor that marks start of a new cinema section
    if (el.attribs?.id?.endsWith("-rotterdam")) {
      // Don't overwrite with anchor — the cinema-name div follows right after
      currentCinemaSlug = el.attribs.id.replace(/-rotterdam$/, "");
      return;
    }

    // Cinema name div
    if (elem.hasClass("cinema-name")) {
      currentCinema = elem.find("a.cinema-link").first().text().trim();
      return;
    }

    // Movie block
    if (elem.hasClass("hall") && currentCinema) {
      const movieTitle = elem
        .find("a.movie-link.text-link")
        .first()
        .text()
        .trim()
        .replace(/\s+/g, " ");

      // Extract slug from the href: /film/movie-slug-2025/popup/rotterdam
      const movieHref =
        elem.find("a.movie-link.text-link").first().attr("href") ?? "";
      const movieSlugMatch = movieHref.match(/\/film\/([^/]+)\//);
      const movieSlug = movieSlugMatch ? movieSlugMatch[1] : movieTitle.toLowerCase().replace(/\s+/g, "-");

      if (!movieTitle) return;

      const showtimes: Showtime[] = [];

      elem.find("[itemprop='startDate']").each((_, stEl) => {
        const datetime = $(stEl).attr("content") ?? "";
        const ticketUrl = $(stEl).find("a.ticket").attr("href") ?? "";
        if (datetime) {
          showtimes.push({ datetime, ticketUrl });
        }
      });

      if (showtimes.length > 0) {
        screenings.push({
          id: `${currentCinemaSlug}|${movieSlug}`,
          cinema: currentCinema,
          cinemaSlug: currentCinemaSlug,
          movieTitle,
          movieSlug,
          showtimes,
        });
      }
    }
  });

  return screenings;
}

/**
 * Returns individual showtime rows sorted chronologically.
 * Each row = one screening at one cinema at one time.
 */
export interface FlatScreening {
  id: string;
  cinema: string;
  cinemaSlug: string;
  movieTitle: string;
  movieSlug: string;
  datetime: string;
  ticketUrl: string;
}

export function flattenScreenings(
  screenings: Screening[],
  from: Date = new Date()
): FlatScreening[] {
  const flat: FlatScreening[] = [];

  for (const s of screenings) {
    for (const st of s.showtimes) {
      if (new Date(st.datetime) >= from) {
        flat.push({
          id: `${s.id}|${st.datetime}`,
          cinema: s.cinema,
          cinemaSlug: s.cinemaSlug,
          movieTitle: s.movieTitle,
          movieSlug: s.movieSlug,
          datetime: st.datetime,
          ticketUrl: st.ticketUrl,
        });
      }
    }
  }

  flat.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  return flat;
}
