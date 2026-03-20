/**
 * @jest-environment node
 */
import { getDirector, formatRuntime, getReleaseYear } from "@/lib/tmdb";

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