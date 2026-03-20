import { NextRequest, NextResponse } from "next/server";
import { searchCinemasByQuery } from "@/lib/cinemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  let location: { lat: number; lng: number } | undefined;

  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      location = { lat: latitude, lng: longitude };
    }
  }

  try {
    const cinemas = await searchCinemasByQuery(query, location);
    return NextResponse.json({ cinemas });
  } catch (error) {
    console.error("Cinema search error:", error);
    return NextResponse.json(
      { error: "Failed to search cinemas" },
      { status: 500 }
    );
  }
}
