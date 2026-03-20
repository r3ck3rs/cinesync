"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MapPin, Star, X, Loader2, Navigation } from "lucide-react";
import type { Cinema } from "@/lib/cinemas";

interface CinemaPickerProps {
  onSelect: (cinema: Cinema) => void;
  selectedCinema?: Cinema | null;
  onClear?: () => void;
}

export function CinemaPicker({
  onSelect,
  selectedCinema,
  onClear,
}: CinemaPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchCinemas = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() && !userLocation) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (userLocation) {
          params.set("lat", String(userLocation.lat));
          params.set("lng", String(userLocation.lng));
        }

        const endpoint = searchQuery.trim()
          ? `/api/cinemas/search?${params}`
          : `/api/cinemas/nearby?${params}`;

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setResults(data.cinemas || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    },
    [userLocation]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || userLocation) {
        searchCinemas(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchCinemas, userLocation]);

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

  async function requestLocation() {
    if (!navigator.geolocation) {
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setLocationLoading(false);
        setIsOpen(true);
      },
      () => {
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function formatDistance(km: number | undefined): string {
    if (!km) return "";
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  if (selectedCinema) {
    return (
      <div className="flex items-center gap-3 bg-surface-elevated border border-white/10 rounded-xl p-3">
        <div className="w-12 h-12 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{selectedCinema.name}</p>
          <p className="text-xs text-gray-500 truncate">{selectedCinema.address}</p>
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
          placeholder="Zoek een bioscoop..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-12 pr-20 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/50 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
          )}
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationLoading}
            className="p-1.5 text-gray-400 hover:text-brand-400 transition-colors disabled:opacity-50"
            title="Gebruik mijn locatie"
          >
            {locationLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {results.slice(0, 10).map((cinema) => (
            <button
              key={cinema.placeId}
              type="button"
              onClick={() => {
                onSelect(cinema);
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{cinema.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{cinema.address}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                {cinema.distance && (
                  <span className="text-xs text-gray-400">
                    {formatDistance(cinema.distance)}
                  </span>
                )}
                {cinema.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {cinema.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && (query || userLocation) && !loading && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Geen bioscopen gevonden</p>
        </div>
      )}
    </div>
  );
}
