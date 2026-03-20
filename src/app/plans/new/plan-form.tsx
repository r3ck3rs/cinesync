"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Film,
  MapPin,
  Clock,
  Users,
  Globe,
  Lock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { MoviePicker } from "@/components/movie-picker";
import { CinemaPicker } from "@/components/cinema-picker";
import { ShowtimePicker } from "@/components/showtime-picker";
import { getPosterUrl } from "@/lib/tmdb";
import type { Cinema, Showtime } from "@/lib/cinemas";
import { createPlan, type CreatePlanData } from "./actions";

interface SelectedMovie {
  id: number;
  title: string;
  posterPath: string | null;
}

type Step = "movie" | "cinema" | "showtime" | "details" | "review";

const STEPS: Step[] = ["movie", "cinema", "showtime", "details", "review"];

const STEP_INFO: Record<Step, { title: string; description: string; icon: typeof Film }> = {
  movie: { title: "Film", description: "Welke film wil je zien?", icon: Film },
  cinema: { title: "Bioscoop", description: "Waar wil je kijken?", icon: MapPin },
  showtime: { title: "Tijdstip", description: "Wanneer wil je gaan?", icon: Clock },
  details: { title: "Details", description: "Wie mag er mee?", icon: Users },
  review: { title: "Bevestigen", description: "Controleer je plan", icon: Check },
};

export function PlanForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<Step>("movie");
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [maxSpots, setMaxSpots] = useState(6);
  const [notes, setNotes] = useState("");

  const currentStepIndex = STEPS.indexOf(currentStep);

  function canProceed(): boolean {
    switch (currentStep) {
      case "movie":
        return selectedMovie !== null;
      case "cinema":
        return selectedCinema !== null;
      case "showtime":
        return selectedShowtime !== null;
      case "details":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  }

  function goNext() {
    if (currentStepIndex < STEPS.length - 1 && canProceed()) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
      setError(null);
    }
  }

  function goPrev() {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
      setError(null);
    }
  }

  function handleSubmit() {
    if (!selectedMovie || !selectedCinema || !selectedShowtime) {
      setError("Vul alle verplichte velden in");
      return;
    }

    const planData: CreatePlanData = {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      moviePosterPath: selectedMovie.posterPath,
      cinemaId: selectedCinema.placeId,
      cinemaName: selectedCinema.name,
      cinemaAddress: selectedCinema.address,
      showtimeId: selectedShowtime.id,
      scheduledAt: selectedShowtime.startTime,
      isPublic,
      maxSpots,
      notes,
    };

    startTransition(async () => {
      const result = await createPlan(planData);
      if (!result.success) {
        setError(result.error || "Er ging iets mis");
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-white">Nieuw plan</h1>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Annuleren
            </button>
          </div>

          <div className="flex items-center gap-1">
            {STEPS.map((step, index) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < currentStepIndex
                      ? "bg-brand-500"
                      : index === currentStepIndex
                      ? "bg-brand-500"
                      : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const Icon = STEP_INFO[currentStep].icon;
              return (
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
              );
            })()}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {STEP_INFO[currentStep].title}
              </h2>
              <p className="text-sm text-gray-400">
                {STEP_INFO[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {currentStep === "movie" && (
          <div className="space-y-4">
            <MoviePicker
              onSelect={setSelectedMovie}
              selectedMovie={selectedMovie}
              onClear={() => setSelectedMovie(null)}
            />
          </div>
        )}

        {currentStep === "cinema" && (
          <div className="space-y-4">
            <CinemaPicker
              onSelect={setSelectedCinema}
              selectedCinema={selectedCinema}
              onClear={() => {
                setSelectedCinema(null);
                setSelectedShowtime(null);
              }}
            />
          </div>
        )}

        {currentStep === "showtime" && selectedMovie && selectedCinema && (
          <ShowtimePicker
            cinemaId={selectedCinema.placeId}
            movieId={selectedMovie.id}
            movieTitle={selectedMovie.title}
            onSelect={setSelectedShowtime}
            selectedShowtime={selectedShowtime}
          />
        )}

        {currentStep === "details" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Zichtbaarheid
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    isPublic
                      ? "bg-brand-600/20 border-brand-500 text-white"
                      : "bg-surface-elevated border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Openbaar</p>
                    <p className="text-xs opacity-70">Iedereen kan meedoen</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    !isPublic
                      ? "bg-brand-600/20 border-brand-500 text-white"
                      : "bg-surface-elevated border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Alleen vrienden</p>
                    <p className="text-xs opacity-70">Op uitnodiging</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Maximaal aantal plekken
              </label>
              <div className="flex items-center gap-4 bg-surface-elevated border border-white/10 rounded-xl p-3">
                <button
                  type="button"
                  onClick={() => setMaxSpots(Math.max(2, maxSpots - 1))}
                  disabled={maxSpots <= 2}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-semibold text-white">{maxSpots}</span>
                  <p className="text-xs text-gray-500">personen (incl. jijzelf)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaxSpots(Math.min(20, maxSpots + 1))}
                  disabled={maxSpots >= 20}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-300"
              >
                Bericht (optioneel)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Voeg een bericht toe voor je groep..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/50 transition-colors resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 text-right">{notes.length}/500</p>
            </div>
          </div>
        )}

        {currentStep === "review" && selectedMovie && selectedCinema && selectedShowtime && (
          <div className="space-y-4">
            <div className="bg-surface-elevated border border-white/10 rounded-xl overflow-hidden">
              <div className="relative h-32 bg-gradient-to-b from-brand-600/20 to-transparent">
                {selectedMovie.posterPath && (
                  <Image
                    src={getPosterUrl(selectedMovie.posterPath, "w500") || ""}
                    alt={selectedMovie.title}
                    fill
                    className="object-cover opacity-30"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-surface-elevated/80 to-transparent" />
              </div>

              <div className="px-4 pb-4 -mt-16 relative">
                <div className="flex gap-4">
                  <div className="w-20 h-30 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-white/5">
                    {selectedMovie.posterPath ? (
                      <Image
                        src={getPosterUrl(selectedMovie.posterPath, "w185") || ""}
                        alt={selectedMovie.title}
                        width={80}
                        height={120}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-8">
                    <h3 className="font-semibold text-white text-lg">
                      {selectedMovie.title}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-elevated border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{selectedCinema.name}</p>
                  <p className="text-sm text-gray-400">{selectedCinema.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">
                    {new Date(selectedShowtime.startTime).toLocaleDateString("nl-NL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(selectedShowtime.startTime).toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {selectedShowtime.screenName} • {selectedShowtime.format}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">
                    {maxSpots} plekken • {isPublic ? "Openbaar" : "Alleen vrienden"}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">{notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Terug
            </button>
          )}

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Volgende
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Plan aanmaken...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Plan aanmaken
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
