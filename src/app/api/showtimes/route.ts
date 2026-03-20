import { NextRequest, NextResponse } from "next/server";
import {
  getShowtimes,
  getShowtimesByCinema,
  getShowtimesByMovie,
  filterShowtimes,
  type ShowtimeFormat,
  type ShowtimeLanguage,
} from "@/lib/cinemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cinemaId = searchParams.get("cinemaId");
  const movieId = searchParams.get("movieId");
  const movieTitle = searchParams.get("movieTitle");
  const date = searchParams.get("date");
  const runtime = searchParams.get("runtime");
  const formats = searchParams.get("formats");
  const languages = searchParams.get("languages");

  if (!date) {
    return NextResponse.json(
      { error: "Parameter 'date' is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const runtimeMinutes = runtime ? parseInt(runtime, 10) : 120;

  try {
    let showtimes;

    if (cinemaId && movieId && movieTitle) {
      showtimes = await getShowtimes(
        cinemaId,
        parseInt(movieId, 10),
        movieTitle,
        date,
        runtimeMinutes
      );
    } else if (cinemaId) {
      return NextResponse.json(
        { error: "Getting all showtimes for a cinema requires movie data" },
        { status: 400 }
      );
    } else if (movieId && movieTitle) {
      const cinemaIds = searchParams.get("cinemaIds");
      if (!cinemaIds) {
        return NextResponse.json(
          { error: "Parameter 'cinemaIds' is required when searching by movie" },
          { status: 400 }
        );
      }
      showtimes = await getShowtimesByMovie(
        parseInt(movieId, 10),
        movieTitle,
        date,
        cinemaIds.split(","),
        runtimeMinutes
      );
    } else {
      return NextResponse.json(
        { error: "Either cinemaId with movie data, or movieId with cinemaIds is required" },
        { status: 400 }
      );
    }

    if (formats || languages) {
      showtimes = filterShowtimes(showtimes, {
        formats: formats ? (formats.split(",") as ShowtimeFormat[]) : undefined,
        languages: languages ? (languages.split(",") as ShowtimeLanguage[]) : undefined,
      });
    }

    return NextResponse.json({ showtimes });
  } catch (error) {
    console.error("Showtimes error:", error);
    return NextResponse.json(
      { error: "Failed to get showtimes" },
      { status: 500 }
    );
  }
}
