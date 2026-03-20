import Image from "next/image";
import Link from "next/link";
import { Film, ChevronRight, Users, Star } from "lucide-react";
import { getPosterUrl } from "@/lib/tmdb";
import { PlanCard, type PlanWithDetails } from "./plan-card";

interface MovieGroup {
  movieId: number | null;
  movieTitle: string;
  moviePosterPath: string | null;
  plans: PlanWithDetails[];
}

interface MovieSectionProps {
  groups: MovieGroup[];
}

export function MovieSections({ groups }: MovieSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <MovieGroupSection key={group.movieId ?? group.movieTitle} group={group} />
      ))}
    </div>
  );
}

function MovieGroupSection({ group }: { group: MovieGroup }) {
  const posterUrl = group.moviePosterPath
    ? getPosterUrl(group.moviePosterPath, "w342")
    : null;

  const totalAttendees = group.plans.reduce(
    (sum, plan) => sum + plan.member_count,
    0
  );

  const nextPlan = group.plans[0];
  const nextShowtime = nextPlan?.scheduled_at
    ? new Date(nextPlan.scheduled_at)
    : null;

  return (
    <section className="space-y-3">
      <div className="flex items-start gap-4">
        <Link
          href={group.movieId ? `/movies/${group.movieId}` : "#"}
          className="relative w-20 h-30 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 shadow-lg"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={group.movieTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-8 h-8 text-gray-600" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 py-1">
          <Link
            href={group.movieId ? `/movies/${group.movieId}` : "#"}
            className="group"
          >
            <h2 className="font-bold text-white text-lg leading-tight group-hover:text-brand-400 transition-colors">
              {group.movieTitle}
            </h2>
          </Link>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {group.plans.length} plan{group.plans.length !== 1 ? "nen" : ""}
            </span>
            <span className="text-gray-600">•</span>
            <span>{totalAttendees} mensen</span>
          </div>

          {nextShowtime && (
            <p className="text-sm text-brand-400 mt-1">
              Eerstvolgende: {formatNextShowtime(nextShowtime)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 pl-0">
        {group.plans.slice(0, 3).map((plan) => (
          <PlanCard key={plan.id} plan={plan} compact />
        ))}

        {group.plans.length > 3 && (
          <Link
            href={group.movieId ? `/movies/${group.movieId}?tab=plans` : "#"}
            className="flex items-center justify-center gap-1 py-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            Bekijk alle {group.plans.length} plannen
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

function formatNextShowtime(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const showDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return `vandaag om ${timeStr}`;
  }

  if (diffDays === 1) {
    return `morgen om ${timeStr}`;
  }

  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function groupPlansByMovie(plans: PlanWithDetails[]): MovieGroup[] {
  const groups = new Map<string, MovieGroup>();

  for (const plan of plans) {
    const key = plan.tmdb_movie_id
      ? `movie-${plan.tmdb_movie_id}`
      : `title-${plan.movie_title || plan.title}`;

    if (!groups.has(key)) {
      groups.set(key, {
        movieId: plan.tmdb_movie_id,
        movieTitle: plan.movie_title || plan.title,
        moviePosterPath: plan.movie_poster_path,
        plans: [],
      });
    }

    groups.get(key)!.plans.push(plan);
  }

  const groupArray = Array.from(groups.values());

  for (const group of groupArray) {
    group.plans.sort((a, b) => {
      if (!a.scheduled_at) return 1;
      if (!b.scheduled_at) return -1;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });
  }

  groupArray.sort((a, b) => {
    const aNext = a.plans[0]?.scheduled_at;
    const bNext = b.plans[0]?.scheduled_at;
    if (!aNext) return 1;
    if (!bNext) return -1;
    return new Date(aNext).getTime() - new Date(bNext).getTime();
  });

  return groupArray;
}
