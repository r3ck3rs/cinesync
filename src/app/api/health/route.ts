import { NextResponse } from "next/server";
import { getRotterdamScreenings } from "@/lib/screenings";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let scraper: "ok" | "error" = "ok";
  let scraperMs = 0;
  let screeningCount = 0;

  try {
    const screenings = await getRotterdamScreenings();
    scraperMs = Date.now() - start;
    screeningCount = screenings.length;
  } catch {
    scraper = "error";
    scraperMs = Date.now() - start;
  }

  const status = scraper === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status: scraper === "ok" ? "ok" : "degraded",
      scraper,
      scraperMs,
      screeningCount,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
