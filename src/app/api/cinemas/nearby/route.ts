import { NextRequest, NextResponse } from "next/server";
import { searchCinemasNearby } from "@/lib/cinemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Parameters 'lat' and 'lng' are required" },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: "Invalid coordinates" },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: "Coordinates out of range" },
      { status: 400 }
    );
  }

  const radiusMeters = radius ? parseInt(radius, 10) : 10000;

  try {
    const cinemas = await searchCinemasNearby(
      { lat: latitude, lng: longitude },
      radiusMeters
    );
    return NextResponse.json({ cinemas });
  } catch (error) {
    console.error("Cinema nearby search error:", error);
    return NextResponse.json(
      { error: "Failed to search nearby cinemas" },
      { status: 500 }
    );
  }
}
