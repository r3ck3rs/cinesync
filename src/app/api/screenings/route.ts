import { NextResponse } from "next/server";
import { getRotterdamScreenings, flattenScreenings } from "@/lib/screenings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const screenings = await getRotterdamScreenings();
    const flat = flattenScreenings(screenings);
    return NextResponse.json({ screenings: flat });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}