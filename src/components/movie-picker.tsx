"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Film, Star, X, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  getPosterUrl,
  formatReleaseYear,
  formatVoteAverage,
  type TMDbMovie,
} from "@/lib/tmdb";

interface MoviePickerProps {
  onSelect: (movie: {
    id: number;
    title: string;
    posterPath: string | null;
  }) => void;
  selectedMovie?: {
    id: number;
    title: string;
    posterPath: string | null;
  } | null;
  onClear?: () => void;
}

export function MoviePicker({
  onSelect,
  selectedMovie,
  onClear,
}: MoviePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchMovies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/movies/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMovies(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchMovies]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedMovie) {
    const posterUrl = getPosterUrl(selectedMovie.posterPath, "w92");

    return (
      <div className="flex items-center gap-3 bg-surface-elevated border border-white/10 rounded-xl p-3">
        <div className="relative w-12 h-18 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={selectedMovie.title}
              width={48}
              height={72}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">
            {selectedMovie.title}
          </p>
          <p className="text-xs text-gray-500">Film geselecteerd</p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Zoek een film..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/50 transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {results.slice(0, 10).map((movie) => (
            <MovieOption
              key={movie.id}
              movie={movie}
              onSelect={() => {
                onSelect({
                  id: movie.id,
                  title: movie.title,
                  posterPath: movie.poster_path,
                });
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}

      {isOpen && query && !loading && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Geen films gevonden</p>
        </div>
      )}
    </div>
  );
}

function MovieOption({
  movie,
  onSelect,
}: {
  movie: TMDbMovie;
  onSelect: () => void;
}) {
  const posterUrl = getPosterUrl(movie.poster_path, "w92");

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
    >
      <div className="relative w-10 h-15 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            width={40}
            height={60}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{movie.title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {movie.release_date && (
            <span>{formatReleaseYear(movie.release_date)}</span>
          )}
          {movie.vote_average > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {formatVoteAverage(movie.vote_average)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
