/**
 * @jest-environment node
 */
import { parseScreenings, flattenScreenings } from "@/lib/screenings";

// Minimal filmladder.nl-style HTML snippet with two cinemas + movies
const SAMPLE_HTML = `
<html><body>
  <div style="position:absolute;" id="cinerama-rotterdam"></div>
  <div class="cinema">
    <div class="info cinema-name">
      <a class="cinema-link" href="/bioscoop/cinerama-rotterdam/popup">Cinerama</a>
    </div>
    <div class="hall champagne-2026">
      <a title="Champagne" class="movie-link text-link" href="/film/champagne-2026/popup/rotterdam">Champagne </a>
      <div itemprop="startDate" content="2030-06-01T15:00:00+02:00">
        <a class="ticket" href="/kaartjes/111">15:00</a>
      </div>
      <div itemprop="startDate" content="2030-06-01T19:00:00+02:00">
        <a class="ticket" href="/kaartjes/112">19:00</a>
      </div>
    </div>
    <div class="hall dreams-2025">
      <a title="Dreams" class="movie-link text-link" href="/film/dreams-2025/popup/rotterdam">Dreams </a>
      <div itemprop="startDate" content="2030-06-02T20:00:00+02:00">
        <a class="ticket" href="/kaartjes/113">20:00</a>
      </div>
    </div>
  </div>

  <div style="position:absolute;" id="pathe-schouwburgplein-rotterdam"></div>
  <div class="cinema">
    <div class="info cinema-name">
      <a class="cinema-link" href="/bioscoop/pathe-schouwburgplein-rotterdam/popup">Pathé Schouwburgplein</a>
    </div>
    <div class="hall project-hail-mary-2025">
      <a title="Project Hail Mary" class="movie-link text-link" href="/film/project-hail-mary-2025/popup/rotterdam">Project Hail Mary </a>
      <div itemprop="startDate" content="2030-06-01T18:30:00+02:00">
        <a class="ticket" href="/kaartjes/200">18:30</a>
      </div>
    </div>
  </div>
</body></html>
`;

describe("parseScreenings", () => {
  it("extracts cinema names correctly", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    const cinemas = [...new Set(screenings.map((s) => s.cinema))];
    expect(cinemas).toContain("Cinerama");
    expect(cinemas).toContain("Pathé Schouwburgplein");
  });

  it("extracts movie titles correctly", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    const titles = screenings.map((s) => s.movieTitle);
    expect(titles).toContain("Champagne");
    expect(titles).toContain("Dreams");
    expect(titles).toContain("Project Hail Mary");
  });

  it("extracts showtimes with ISO datetime", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    const champagne = screenings.find((s) => s.movieTitle === "Champagne");
    expect(champagne).toBeDefined();
    expect(champagne!.showtimes).toHaveLength(2);
    expect(champagne!.showtimes[0].datetime).toBe("2030-06-01T15:00:00+02:00");
    expect(champagne!.showtimes[0].ticketUrl).toBe("/kaartjes/111");
  });

  it("extracts movie slug from href", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    const champagne = screenings.find((s) => s.movieTitle === "Champagne");
    expect(champagne!.movieSlug).toBe("champagne-2026");
  });

  it("returns no screenings for empty HTML", () => {
    const screenings = parseScreenings("<html><body></body></html>");
    expect(screenings).toHaveLength(0);
  });
});

describe("flattenScreenings", () => {
  it("returns all future showtimes sorted chronologically", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    // All times in SAMPLE_HTML are far in the future (2030)
    const flat = flattenScreenings(screenings, new Date("2020-01-01"));

    // Should have 4 total (2 Champagne + 1 Dreams + 1 Project Hail Mary)
    expect(flat).toHaveLength(4);

    // Should be sorted ascending by datetime
    for (let i = 1; i < flat.length; i++) {
      expect(new Date(flat[i].datetime).getTime()).toBeGreaterThanOrEqual(
        new Date(flat[i - 1].datetime).getTime()
      );
    }
  });

  it("filters out past showtimes", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    // All times are 2030, so setting from=2031 should return nothing
    const flat = flattenScreenings(screenings, new Date("2031-01-01"));
    expect(flat).toHaveLength(0);
  });

  it("includes cinema and movie info in each flat row", () => {
    const screenings = parseScreenings(SAMPLE_HTML);
    const flat = flattenScreenings(screenings, new Date("2020-01-01"));
    const row = flat.find((f) => f.movieTitle === "Project Hail Mary");
    expect(row).toBeDefined();
    expect(row!.cinema).toBe("Pathé Schouwburgplein");
    expect(row!.ticketUrl).toBe("/kaartjes/200");
  });
});