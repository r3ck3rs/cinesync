import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Users,
  Globe,
  Lock,
  Film,
  Calendar,
  ExternalLink,
  UserPlus,
  Check,
  X,
  Hourglass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPosterUrl } from "@/lib/tmdb";
import {
  ApproveMemberButton,
  DeclineMemberButton,
  LeavePlanButton,
} from "./member-actions";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

interface PlanDetails {
  id: string;
  title: string;
  movie_title: string | null;
  movie_poster_path: string | null;
  tmdb_movie_id: number | null;
  scheduled_at: string | null;
  cinema_name: string | null;
  cinema_id: string | null;
  location: string | null;
  notes: string | null;
  is_public: boolean;
  max_spots: number | null;
  status: "planning" | "confirmed" | "done" | "cancelled";
  created_by: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PlanMember {
  id: string;
  user_id: string;
  role: "owner" | "member";
  rsvp: "pending" | "accepted" | "declined";
  joined_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/plans/${id}`);
  }

  const { data: plan, error } = await supabase
    .from("plans")
    .select(
      `
      id,
      title,
      movie_title,
      movie_poster_path,
      tmdb_movie_id,
      scheduled_at,
      cinema_name,
      cinema_id,
      location,
      notes,
      is_public,
      max_spots,
      status,
      created_by,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !plan) {
    notFound();
  }

  const typedPlan = plan as unknown as PlanDetails;

  const { data: members } = await supabase
    .from("plan_members")
    .select(
      `
      id,
      user_id,
      role,
      rsvp,
      joined_at,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("plan_id", id)
    .order("joined_at", { ascending: true });

  const typedMembers = (members || []) as unknown as PlanMember[];
  const acceptedMembers = typedMembers.filter((m) => m.rsvp === "accepted");
  const pendingMembers = typedMembers.filter((m) => m.rsvp === "pending");
  const currentUserMembership = typedMembers.find((m) => m.user_id === user.id);
  const isOwner = typedPlan.created_by === user.id;
  const isMember = !!currentUserMembership;
  const spotsLeft =
    typedPlan.max_spots !== null
      ? typedPlan.max_spots - acceptedMembers.length
      : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const posterUrl = typedPlan.movie_poster_path
    ? getPosterUrl(typedPlan.movie_poster_path, "w500")
    : null;
  const scheduledAt = typedPlan.scheduled_at
    ? new Date(typedPlan.scheduled_at)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <article className="space-y-6">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-elevated border border-white/10">
          <div className="flex">
            <div className="relative w-32 sm:w-40 h-48 sm:h-60 flex-shrink-0 bg-white/5">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={typedPlan.movie_title || typedPlan.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>

            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={typedPlan.status} />
                  {typedPlan.is_public ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Globe className="w-3 h-3" />
                      Openbaar
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3 h-3" />
                      Privé
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {typedPlan.movie_title || typedPlan.title}
                </h1>

                {typedPlan.profiles && (
                  <p className="text-sm text-gray-400 mt-1">
                    door{" "}
                    <span className="text-white">
                      @{typedPlan.profiles.username}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2 mt-4">
                {scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span>{formatFullDateTime(scheduledAt)}</span>
                  </div>
                )}

                {typedPlan.cinema_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <span>{typedPlan.cinema_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>
                    {acceptedMembers.length}
                    {typedPlan.max_spots && ` / ${typedPlan.max_spots}`}{" "}
                    deelnemers
                  </span>
                  {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 3 && (
                    <span className="text-xs text-orange-400 ml-1">
                      (nog {spotsLeft} plek{spotsLeft !== 1 ? "ken" : ""})
                    </span>
                  )}
                  {isFull && (
                    <span className="text-xs text-red-400 ml-1">(vol)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join CTA */}
        {!isMember && !isFull && typedPlan.status !== "cancelled" && typedPlan.status !== "done" && (
          <Link
            href={`/plans/${id}/join`}
            className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Deelnemen aan dit plan
          </Link>
        )}

        {isFull && !isMember && (
          <div className="flex items-center justify-center gap-2 w-full bg-white/5 text-gray-400 font-medium py-4 rounded-xl border border-white/10">
            <Users className="w-5 h-5" />
            Dit plan is vol
          </div>
        )}

        {isMember && (
          <MembershipStatus membership={currentUserMembership} isOwner={isOwner} planId={id} />
        )}

        {/* Notes */}
        {typedPlan.notes && (
          <section className="bg-surface-elevated border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Notities
            </h2>
            <p className="text-gray-200 whitespace-pre-wrap">{typedPlan.notes}</p>
          </section>
        )}

        {/* Location */}
        {typedPlan.location && (
          <section className="bg-surface-elevated border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Locatie
            </h2>
            <p className="text-gray-200">{typedPlan.location}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(typedPlan.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 text-sm mt-2 hover:underline"
            >
              Bekijk op kaart
              <ExternalLink className="w-3 h-3" />
            </a>
          </section>
        )}

        {/* Members */}
        <section className="bg-surface-elevated border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Deelnemers ({acceptedMembers.length})
          </h2>
          <div className="space-y-2">
            {acceptedMembers.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>

          {isOwner && pendingMembers.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mt-4 mb-3">
                Wachtend op goedkeuring ({pendingMembers.length})
              </h3>
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <PendingMemberRow key={member.id} member={member} planId={id} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Movie Link */}
        {typedPlan.tmdb_movie_id && (
          <Link
            href={`/movies/${typedPlan.tmdb_movie_id}`}
            className="flex items-center justify-center gap-2 text-brand-400 hover:text-brand-300 text-sm py-3 transition-colors"
          >
            <Film className="w-4 h-4" />
            Bekijk filmdetails
          </Link>
        )}
      </article>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    planning: { label: "Planning", className: "bg-blue-500/20 text-blue-400" },
    confirmed: { label: "Bevestigd", className: "bg-green-500/20 text-green-400" },
    done: { label: "Afgelopen", className: "bg-gray-500/20 text-gray-400" },
    cancelled: { label: "Geannuleerd", className: "bg-red-500/20 text-red-400" },
  }[status] || { label: status, className: "bg-gray-500/20 text-gray-400" };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.className}`}>
      {config.label}
    </span>
  );
}

function MembershipStatus({
  membership,
  isOwner,
  planId,
}: {
  membership: PlanMember;
  isOwner: boolean;
  planId: string;
}) {
  if (isOwner) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-brand-600/10 text-brand-400 font-medium py-4 rounded-xl border border-brand-600/20">
        <Check className="w-5 h-5" />
        Jij bent de organisator
      </div>
    );
  }

  if (membership.rsvp === "accepted") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 w-full bg-green-500/10 text-green-400 font-medium py-4 rounded-xl border border-green-500/20">
          <Check className="w-5 h-5" />
          Je doet mee aan dit plan
        </div>
        <LeavePlanButton planId={planId} />
      </div>
    );
  }

  if (membership.rsvp === "pending") {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-yellow-500/10 text-yellow-400 font-medium py-4 rounded-xl border border-yellow-500/20">
        <Hourglass className="w-5 h-5" />
        Wachtend op goedkeuring van de organisator
      </div>
    );
  }

  if (membership.rsvp === "declined") {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-red-500/10 text-red-400 font-medium py-4 rounded-xl border border-red-500/20">
        <X className="w-5 h-5" />
        Je verzoek is afgewezen
      </div>
    );
  }

  return null;
}

function MemberRow({ member }: { member: PlanMember }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
        {member.profiles?.avatar_url ? (
          <Image
            src={member.profiles.avatar_url}
            alt={member.profiles.username}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-400">
            {member.profiles?.username?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">
          @{member.profiles?.username}
        </p>
        {member.profiles?.full_name && (
          <p className="text-xs text-gray-500 truncate">
            {member.profiles.full_name}
          </p>
        )}
      </div>
      {member.role === "owner" && (
        <span className="text-xs text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded">
          Organisator
        </span>
      )}
    </div>
  );
}

function PendingMemberRow({
  member,
  planId,
}: {
  member: PlanMember;
  planId: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
        {member.profiles?.avatar_url ? (
          <Image
            src={member.profiles.avatar_url}
            alt={member.profiles.username}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-400">
            {member.profiles?.username?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">
          @{member.profiles?.username}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ApproveMemberButton planId={planId} memberId={member.id} />
        <DeclineMemberButton planId={planId} memberId={member.id} />
      </div>
    </div>
  );
}

function formatFullDateTime(date: Date): string {
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
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
