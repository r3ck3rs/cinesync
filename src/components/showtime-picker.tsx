"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Calendar, Loader2, ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { Showtime, ShowtimeFormat, ShowtimeLanguage } from "@/lib/cinemas";
import {
  formatShowtime,
  formatLanguageShort,
  formatPriceCategory,
  getAvailabilityLabel,
  getAvailabilityColor,
} from "@/lib/cinemas";

interface ShowtimePickerProps {
  cinemaId: string;
  movieId: number;
  movieTitle: string;
  runtime?: number;
  onSelect: (showtime: Showtime) => void;
  selectedShowtime?: Showtime | null;
}

const FORMAT_COLORS: Record<ShowtimeFormat, string> = {
  "2D": "bg-gray-600",
  "3D": "bg-blue-600",
  "IMAX": "bg-amber-600",
  "IMAX3D": "bg-amber-600",
  "4DX": "bg-purple-600",
  "Dolby Cinema": "bg-red-600",
  "ScreenX": "bg-cyan-600",
};

function getNextDays(count: number): { date: string; label: string; dayLabel: string }[] {
  const days = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("nl-NL", { weekday: "short" });
    const label = date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

    let displayDay = dayLabel;
    if (i === 0) displayDay = "Vandaag";
    if (i === 1) displayDay = "Morgen";

    days.push({ date: dateStr, label, dayLabel: displayDay });
  }

  return days;
}

export function ShowtimePicker({
  cinemaId,
  movieId,
  movieTitle,
  runtime = 120,
  onSelect,
  selectedShowtime,
}: ShowtimePickerProps) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [dateOffset, setDateOffset] = useState(0);

  const days = getNextDays(14);
  const visibleDays = days.slice(dateOffset, dateOffset + 5);

  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        cinemaId,
        movieId: String(movieId),
        movieTitle,
        date: selectedDate,
        runtime: String(runtime),
      });

      const response = await fetch(`/api/showtimes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setShowtimes(data.showtimes || []);
      }
    } catch (error) {
      console.error("Failed to fetch showtimes:", error);
    } finally {
      setLoading(false);
    }
  }, [cinemaId, movieId, movieTitle, selectedDate, runtime]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  const groupedShowtimes = showtimes.reduce<Record<string, Showtime[]>>(
    (acc, showtime) => {
      const key = showtime.screenName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(showtime);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
          disabled={dateOffset === 0}
          className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex gap-1 overflow-hidden">
          {visibleDays.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`flex-1 py-2 px-1 rounded-lg text-center transition-colors ${
                selectedDate === day.date
                  ? "bg-brand-600 text-white"
                  : "bg-surface-elevated text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="text-xs font-medium">{day.dayLabel}</div>
              <div className="text-[10px] opacity-70">{day.label}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDateOffset(Math.min(days.length - 5, dateOffset + 1))}
          disabled={dateOffset >= days.length - 5}
          className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : showtimes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Geen voorstellingen op deze dag</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedShowtimes).map(([screenName, screenShowtimes]) => (
            <div key={screenName} className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {screenName}
              </h4>
              <div className="flex flex-wrap gap-2">
                {screenShowtimes.map((showtime) => {
                  const isSelected = selectedShowtime?.id === showtime.id;
                  const isSoldOut = showtime.availableSeats === 0;

                  return (
                    <button
                      key={showtime.id}
                      type="button"
                      onClick={() => !isSoldOut && onSelect(showtime)}
                      disabled={isSoldOut}
                      className={`relative flex flex-col items-center px-3 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-brand-600 border-brand-500 text-white"
                          : isSoldOut
                          ? "bg-surface-elevated border-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-surface-elevated border-white/10 text-white hover:border-brand-600/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          {formatShowtime(showtime.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${FORMAT_COLORS[showtime.format]} text-white`}
                        >
                          {showtime.format}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatLanguageShort(showtime.language)}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] mt-1 ${
                          isSelected
                            ? "text-white/80"
                            : getAvailabilityColor(showtime.availableSeats, showtime.totalSeats)
                        }`}
                      >
                        {getAvailabilityLabel(showtime.availableSeats, showtime.totalSeats)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedShowtime && (
        <div className="bg-brand-600/10 border border-brand-600/20 rounded-xl p-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {new Date(selectedShowtime.startTime).toLocaleDateString("nl-NL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                om {formatShowtime(selectedShowtime.startTime)}
              </p>
              <p className="text-xs text-gray-400">
                {selectedShowtime.screenName} • {selectedShowtime.format} •{" "}
                {formatPriceCategory(selectedShowtime.priceCategory)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
