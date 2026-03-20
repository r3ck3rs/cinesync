/**
 * @jest-environment node
 */
import { getDirector, formatRuntime, getReleaseYear, searchMovies } from "@/lib/tmdb";

describe("TMDb helpers", () => {
  describe("getDirector", () => {
    it("returns director name from crew", () => {
      const crew = [
        { job: "Producer", name: "John" },
        { job: "Director", name: "Jane Doe" },
        { job: "Writer", name: "Bob" },
      ];
      expect(getDirector(crew)).toBe("Jane Doe");
    });

    it("returns null if no director found", () => {
      const crew = [
        { job: "Producer", name: "John" },
        { job: "Writer", name: "Bob" },
      ];
      expect(getDirector(crew)).toBeNull();
    });
  });

  describe("formatRuntime", () => {
    it("formats 120 minutes as 2h 0m", () => {
      expect(formatRuntime(120)).toBe("2h 0m");
    });

    it("formats 95 minutes as 1h 35m", () => {
      expect(formatRuntime(95)).toBe("1h 35m");
    });

    it("formats 45 minutes as 0h 45m", () => {
      expect(formatRuntime(45)).toBe("0h 45m");
    });
  });

  describe("getReleaseYear", () => {
    it("extracts year from ISO date", () => {
      expect(getReleaseYear("2024-03-20")).toBe("2024");
    });

    it("handles empty string", () => {
      expect(getReleaseYear("")).toBe("");
    });
  });
});

describe("searchMovies", () => {
  const originalEnv = process.env;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses TMDB_API_KEY env var when set", async () => {
    process.env.TMDB_API_KEY = "server-key";
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    await searchMovies("test");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer server-key");
  });

  it("falls back to NEXT_PUBLIC_TMDB_API_KEY when TMDB_API_KEY is not set", async () => {
    delete process.env.TMDB_API_KEY;
    process.env.NEXT_PUBLIC_TMDB_API_KEY = "public-key";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    await searchMovies("test");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer public-key");
  });

  it("returns empty array when neither key is set (no crash)", async () => {
    delete process.env.TMDB_API_KEY;
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    const result = await searchMovies("test");
    expect(result).toEqual([]);
  });

  it("returns empty array when fetch fails (graceful)", async () => {
    process.env.TMDB_API_KEY = "some-key";

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await searchMovies("test");
    expect(result).toEqual([]);
  });

  it("returns empty array for blank query without calling fetch", async () => {
    const result = await searchMovies("   ");
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
