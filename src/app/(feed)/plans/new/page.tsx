"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchMovies, getPosterUrl, getReleaseYear, type TMDbMovie } from "@/lib/tmdb";
import Image from "next/image";

export default function NewPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<TMDbMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDbMovie | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const [form, setForm] = useState({
    cinema: "",
    date: "",
    time: "",
    audience: "friends" as "friends" | "extended" | "public",
    note: "",
  });

  // Debounced TMDb search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!movieQuery.trim() || selectedMovie) {
      setMovieResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchMovies(movieQuery);
      setMovieResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [movieQuery, selectedMovie]);

  const audienceOptions = [
    { value: "friends", label: "👥 Vrienden", desc: "Alleen je directe vrienden" },
    { value: "extended", label: "🌐 Extended", desc: "Vrienden van vrienden" },
    { value: "public", label: "🌍 Publiek", desc: "Iedereen op CineSync" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Terug
          </button>
          <h1 className="text-xl font-bold">🎬 Plan aanmaken</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-purple-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Welke film?</h2>

            {/* Selected movie */}
            {selectedMovie ? (
              <div className="flex gap-4 bg-gray-900 rounded-xl p-4">
                {selectedMovie.poster_path && (
                  <Image
                    src={getPosterUrl(selectedMovie.poster_path, "w185")}
                    alt={selectedMovie.title}
                    width={60}
                    height={90}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedMovie.title}</p>
                  <p className="text-sm text-gray-400">{getReleaseYear(selectedMovie.release_date)}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedMovie.overview}</p>
                </div>
                <button
                  onClick={() => { setSelectedMovie(null); setMovieQuery(""); }}
                  className="text-gray-500 hover:text-white text-xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Zoek een film..."
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ⏳
                  </div>
                )}

                {/* Search results */}
                {movieResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-xl">
                    {movieResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => {
                          setSelectedMovie(movie);
                          setMovieResults([]);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                      >
                        {movie.poster_path ? (
                          <Image
                            src={getPosterUrl(movie.poster_path, "w185")}
                            alt={movie.title}
                            width={36}
                            height={54}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-14 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">
                            🎬
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{movie.title}</p>
                          <p className="text-sm text-gray-400">{getReleaseYear(movie.release_date)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bioscoop</label>
              <input
                type="text"
                placeholder="Bijv. Pathé Rotterdam"
                value={form.cinema}
                onChange={(e) => setForm({ ...form, cinema: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button
              onClick={() => selectedMovie && form.cinema && setStep(2)}
              disabled={!selectedMovie || !form.cinema}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
            >
              Volgende →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Wanneer?</h2>

            {/* Movie summary */}
            {selectedMovie && (
              <div className="flex items-center gap-3 bg-gray-900 rounded-xl p-3 text-sm">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="font-medium">{selectedMovie.title}</p>
                  <p className="text-gray-400">{form.cinema}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Datum</label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tijd</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => form.date && form.time && setStep(3)}
              disabled={!form.date || !form.time}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
            >
              Volgende →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Wie mag meedoen?</h2>
            <div className="space-y-3">
              {audienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, audience: opt.value as typeof form.audience })}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    form.audience === opt.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-gray-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bericht (optioneel)</label>
              <textarea
                placeholder="Bijv. wie wil mee naar deze thriller?"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-900 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Film</span>
                <span className="font-medium">{selectedMovie?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bioscoop</span>
                <span>{form.cinema}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Datum & tijd</span>
                <span>{form.date} {form.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Publiek</span>
                <span>{audienceOptions.find(o => o.value === form.audience)?.label}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/feed")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              🎟️ Plan publiceren
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
