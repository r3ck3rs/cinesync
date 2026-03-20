import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  Globe,
  Lock,
  Film,
  UserPlus,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPosterUrl } from "@/lib/tmdb";
import { JoinButton } from "./join-button";

interface JoinPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

interface PlanPreview {
  id: string;
  title: string;
  movie_title: string | null;
  movie_poster_path: string | null;
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
}

export default async function JoinPlanPage({
  params,
  searchParams,
}: JoinPageProps) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/plans/${id}/join`);
  }

  // Fetch plan details
  const { data: plan, error } = await supabase
    .from("plans")
    .select(
      `
      id,
      title,
      movie_title,
      movie_poster_path,
      scheduled_at,
      cinema_name,
      location,
      is_public,
      max_spots,
      status,
      created_by,
      profiles (
        username,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !plan) {
    notFound();
  }

  const typedPlan = plan as unknown as PlanPreview;

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("plan_members")
    .select("rsvp")
    .eq("plan_id", id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    redirect(`/plans/${id}`);
  }

  // Get accepted member count for capacity check
  const { count: acceptedCount } = await supabase
    .from("plan_members")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", id)
    .eq("rsvp", "accepted");

  const memberCount = acceptedCount || 0;
  const spotsLeft =
    typedPlan.max_spots !== null ? typedPlan.max_spots - memberCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isInactive =
    typedPlan.status === "cancelled" || typedPlan.status === "done";

  const posterUrl = typedPlan.movie_poster_path
    ? getPosterUrl(typedPlan.movie_poster_path, "w342")
    : null;
  const scheduledAt = typedPlan.scheduled_at
    ? new Date(typedPlan.scheduled_at)
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href={`/plans/${id}`}
        className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Terug naar plan
      </Link>

      <div className="bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden">
        {/* Plan Preview */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-4">
            <div className="relative w-20 h-30 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={typedPlan.movie_title || typedPlan.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-8 h-8 text-gray-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {typedPlan.is_public ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="w-3 h-3" />
                    Openbaar
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Lock className="w-3 h-3" />
                    Goedkeuring vereist
                  </span>
                )}
              </div>

              <h1 className="text-lg font-bold text-white leading-tight line-clamp-2">
                {typedPlan.movie_title || typedPlan.title}
              </h1>

              {typedPlan.profiles && (
                <p className="text-sm text-gray-400 mt-1">
                  door @{typedPlan.profiles.username}
                </p>
              )}

              <div className="space-y-1 mt-3">
                {scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>{formatDateTime(scheduledAt)}</span>
                  </div>
                )}

                {typedPlan.cinema_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{typedPlan.cinema_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>
                    {memberCount}
                    {typedPlan.max_spots && ` / ${typedPlan.max_spots}`}{" "}
                    deelnemers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Section */}
        <div className="p-6">
          {errorParam && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{decodeURIComponent(errorParam)}</p>
            </div>
          )}

          {isInactive ? (
            <div className="text-center py-4">
              <p className="text-gray-400">
                {typedPlan.status === "cancelled"
                  ? "Dit plan is geannuleerd"
                  : "Dit plan is al afgelopen"}
              </p>
              <Link
                href={`/plans/${id}`}
                className="inline-block mt-4 text-brand-400 hover:text-brand-300 text-sm"
              >
                Bekijk plandetails
              </Link>
            </div>
          ) : isFull ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-gray-200 font-medium">Dit plan is vol</p>
              <p className="text-gray-500 text-sm mt-1">
                Alle {typedPlan.max_spots} plekken zijn bezet
              </p>
              <Link
                href={`/plans/${id}`}
                className="inline-block mt-4 text-brand-400 hover:text-brand-300 text-sm"
              >
                Bekijk plandetails
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-600/10 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-brand-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Deelnemen aan dit plan?
                </h2>
                {typedPlan.is_public ? (
                  <p className="text-gray-400 text-sm mt-1">
                    Je wordt direct toegevoegd als deelnemer
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">
                    De organisator moet je verzoek goedkeuren
                  </p>
                )}

                {spotsLeft !== null && spotsLeft <= 5 && (
                  <p className="text-orange-400 text-sm mt-2">
                    Nog {spotsLeft} plek{spotsLeft !== 1 ? "ken" : ""} beschikbaar
                  </p>
                )}
              </div>

              <JoinButton planId={id} isPublic={typedPlan.is_public} />

              <p className="text-center text-xs text-gray-600 mt-4">
                Door deel te nemen ga je akkoord met de huisregels van CineSync
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  if (isToday) {
    return `Vandaag om ${timeStr}`;
  }

  if (isTomorrow) {
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
