"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Clock, ChevronDown, X, Navigation } from "lucide-react";

interface FeedFiltersProps {
  defaultRadius?: number;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

export function FeedFilters({ defaultRadius = 25 }: FeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isTonight, setIsTonight] = useState(
    searchParams.get("tonight") === "true"
  );
  const [radius, setRadius] = useState(
    Number(searchParams.get("radius")) || defaultRadius
  );
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      router.push(`/?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleTonightToggle = () => {
    const newValue = !isTonight;
    setIsTonight(newValue);
    updateUrl({ tonight: newValue ? "true" : null });
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setShowRadiusMenu(false);
    updateUrl({ radius: String(newRadius) });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Locatie wordt niet ondersteund");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        setIsLoadingLocation(false);
        updateUrl({
          lat: String(newLocation.lat.toFixed(6)),
          lng: String(newLocation.lng.toFixed(6)),
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Locatietoegang geweigerd");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Locatie niet beschikbaar");
            break;
          default:
            setLocationError("Kon locatie niet bepalen");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    updateUrl({ lat: null, lng: null });
  };

  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  }, [searchParams]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={handleTonightToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          isTonight
            ? "bg-brand-600 text-white"
            : "bg-surface-elevated border border-white/10 text-gray-300 hover:border-white/20"
        }`}
      >
        <Clock className="w-4 h-4" />
        Vanavond
      </button>

      <div className="relative">
        <button
          onClick={() => setShowRadiusMenu(!showRadiusMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-elevated border border-white/10 text-gray-300 hover:border-white/20 transition-all whitespace-nowrap"
        >
          <MapPin className="w-4 h-4" />
          {radius} km
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {showRadiusMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowRadiusMenu(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-surface-elevated border border-white/10 rounded-xl shadow-xl z-50 py-1 min-w-[100px]">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRadiusChange(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    radius === option.value
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {!location ? (
        <button
          onClick={requestLocation}
          disabled={isLoadingLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-elevated border border-white/10 text-gray-300 hover:border-white/20 transition-all whitespace-nowrap disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          {isLoadingLocation ? "Laden..." : "Gebruik locatie"}
        </button>
      ) : (
        <button
          onClick={clearLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-brand-600/20 border border-brand-600/30 text-brand-400 transition-all whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          Locatie actief
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {locationError && (
        <span className="text-xs text-red-400 whitespace-nowrap">
          {locationError}
        </span>
      )}
    </div>
  );
}
