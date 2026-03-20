import { NextRequest, NextResponse } from "next/server";
import { getCinemaDetails } from "@/lib/cinemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
  }

  try {
    const cinema = await getCinemaDetails(placeId);
    return NextResponse.json({ cinema });
  } catch (error) {
    console.error("Cinema details error:", error);
    return NextResponse.json(
      { error: "Failed to get cinema details" },
      { status: 500 }
    );
  }
}
