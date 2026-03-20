import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, Globe, Lock, Film } from "lucide-react";
import { getPosterUrl } from "@/lib/tmdb";

export interface PlanWithDetails {
  id: string;
  title: string;
  movie_title: string | null;
  movie_poster_path: string | null;
  tmdb_movie_id: number | null;
  scheduled_at: string | null;
  cinema_name: string | null;
  location: string | null;
  is_public: boolean;
  max_spots: number | null;
  status: "planning" | "confirmed" | "done" | "cancelled";
  created_by: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
  member_count: number;
}

interface PlanCardProps {
  plan: PlanWithDetails;
  compact?: boolean;
}

export function PlanCard({ plan, compact = false }: PlanCardProps) {
  const scheduledAt = plan.scheduled_at ? new Date(plan.scheduled_at) : null;
  const posterUrl = plan.movie_poster_path
    ? getPosterUrl(plan.movie_poster_path, "w185")
    : null;

  const isToday = scheduledAt && isDateToday(scheduledAt);
  const isTomorrow = scheduledAt && isDateTomorrow(scheduledAt);
  const spotsLeft =
    plan.max_spots !== null ? plan.max_spots - plan.member_count : null;

  if (compact) {
    return (
      <Link href={`/plans/${plan.id}`} className="block">
        <article className="bg-surface-elevated border border-white/10 rounded-xl p-3 hover:border-brand-600/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-18 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={plan.movie_title || plan.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isToday && (
                  <span className="px-1.5 py-0.5 bg-brand-600/20 text-brand-400 text-[10px] font-semibold rounded uppercase">
                    Vandaag
                  </span>
                )}
                {isTomorrow && (
                  <span className="px-1.5 py-0.5 bg-yellow-600/20 text-yellow-400 text-[10px] font-semibold rounded uppercase">
                    Morgen
                  </span>
                )}
              </div>
              <p className="font-medium text-white text-sm truncate mt-0.5">
                {plan.movie_title || plan.title}
              </p>
              {scheduledAt && (
                <p className="text-xs text-gray-400">
                  {formatTime(scheduledAt)}
                  {plan.cinema_name && ` • ${plan.cinema_name}`}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <Users className="w-3 h-3" />
                  {plan.member_count}
                </span>
                {plan.is_public ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/plans/${plan.id}`} className="block">
      <article className="bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden hover:border-brand-600/50 transition-colors">
        <div className="flex">
          <div className="relative w-24 h-36 flex-shrink-0 bg-white/5">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={plan.movie_title || plan.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-8 h-8 text-gray-600" />
              </div>
            )}
            {(isToday || isTomorrow) && (
              <div className="absolute top-2 left-2">
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                    isToday
                      ? "bg-brand-600 text-white"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  {isToday ? "Vandaag" : "Morgen"}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white leading-tight line-clamp-2">
                  {plan.movie_title || plan.title}
                </h3>
                {plan.is_public ? (
                  <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>

              {plan.profiles && (
                <p className="text-xs text-gray-500 mt-1">
                  door @{plan.profiles.username}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-3">
              {scheduledAt && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>
                    {formatDateTime(scheduledAt)}
                  </span>
                </div>
              )}

              {plan.cinema_name && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{plan.cinema_name}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>
                    {plan.member_count}
                    {plan.max_spots && ` / ${plan.max_spots}`} deelnemers
                  </span>
                </div>
                {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 3 && (
                  <span className="text-xs text-orange-400">
                    Nog {spotsLeft} plek{spotsLeft !== 1 ? "ken" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function isDateToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isDateTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = formatTime(date);

  if (isDateToday(date)) {
    return `Vandaag om ${timeStr}`;
  }

  if (isDateTomorrow(date)) {
    return `Morgen om ${timeStr}`;
  }

  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
