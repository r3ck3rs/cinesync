import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Film, Users, Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";
import { FeedFilters } from "./feed-filters";
import { PlanCard, type PlanWithDetails } from "./plan-card";
import { MovieSections, groupPlansByMovie } from "./movie-section";

interface FeedPageProps {
  searchParams: Promise<{
    tonight?: string;
    radius?: string;
    lat?: string;
    lng?: string;
    view?: string;
  }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <ViewToggle currentView={params.view || "movie"} />
      </header>

      <div className="mb-6">
        <Suspense fallback={<FiltersSkeleton />}>
          <FeedFilters defaultRadius={25} />
        </Suspense>
      </div>

      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent
          tonight={params.tonight === "true"}
          radius={Number(params.radius) || 25}
          lat={params.lat ? parseFloat(params.lat) : undefined}
          lng={params.lng ? parseFloat(params.lng) : undefined}
          view={params.view || "movie"}
        />
      </Suspense>
    </div>
  );
}

function LandingPage() {
  const features = [
    {
      icon: Film,
      title: "Films plannen",
      description: "Zoek films en plan wanneer je ze wil kijken",
    },
    {
      icon: Users,
      title: "Vrienden uitnodigen",
      description: "Sync met vrienden voor gezamenlijke filmsessies",
    },
    {
      icon: Calendar,
      title: "Agenda sync",
      description: "Houd overzicht van al je filmplannen",
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Bespreek films voor, tijdens en na het kijken",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 text-brand-500 text-sm px-4 py-1.5 rounded-full">
            <Film className="w-4 h-4" />
            Sociale cinema app
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Cine
            <span className="text-brand-500">Sync</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            Plan films, sync met vrienden,{" "}
            <span className="text-white">nooit meer solo kijken.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/register"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Gratis starten
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full border border-white/10 transition-colors"
          >
            Inloggen
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full pt-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-surface-elevated border border-white/10 rounded-2xl p-4 text-left space-y-2"
            >
              <Icon className="w-6 h-6 text-brand-500" />
              <p className="font-semibold text-sm text-white">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ViewToggle({ currentView }: { currentView: string }) {
  return (
    <div className="flex items-center bg-surface-elevated border border-white/10 rounded-lg p-0.5">
      <Link
        href="/?view=movie"
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          currentView === "movie"
            ? "bg-brand-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Films
      </Link>
      <Link
        href="/?view=list"
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          currentView === "list"
            ? "bg-brand-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Lijst
      </Link>
    </div>
  );
}

interface PlanQueryResult {
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
}

async function FeedContent({
  tonight,
  radius,
  lat,
  lng,
  view,
}: {
  tonight: boolean;
  radius: number;
  lat?: number;
  lng?: number;
  view: string;
}) {
  const supabase = createClient();

  const now = new Date();
  let startDate: Date;
  let endDate: Date | null = null;

  if (tonight) {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
  } else {
    startDate = now;
  }

  let query = supabase
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
    .eq("is_public", true)
    .in("status", ["planning", "confirmed"])
    .gte("scheduled_at", startDate.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (endDate) {
    query = query.lte("scheduled_at", endDate.toISOString());
  }

  const { data: plansData, error } = await query;

  if (error) {
    console.error("Feed query error:", error);
    return <ErrorState />;
  }

  const typedPlansData = plansData as PlanQueryResult[] | null;
  const planIds = typedPlansData?.map((p) => p.id) || [];
  let memberCounts: Record<string, number> = {};

  if (planIds.length > 0) {
    const { data: membersData } = await supabase
      .from("plan_members")
      .select("plan_id")
      .in("plan_id", planIds)
      .eq("rsvp", "accepted");

    const typedMembers = membersData as { plan_id: string }[] | null;
    if (typedMembers) {
      for (const member of typedMembers) {
        memberCounts[member.plan_id] = (memberCounts[member.plan_id] || 0) + 1;
      }
    }
  }

  const plans: PlanWithDetails[] = (typedPlansData || []).map((plan) => ({
    ...plan,
    member_count: memberCounts[plan.id] || 1,
  }));

  if (plans.length === 0) {
    return <EmptyState tonight={tonight} />;
  }

  if (view === "movie") {
    const groups = groupPlansByMovie(plans);
    return <MovieSections groups={groups} />;
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function EmptyState({ tonight = false }: { tonight?: boolean }) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto">
        <Film className="w-8 h-8 text-gray-600" />
      </div>
      <div>
        <p className="text-gray-400 font-medium">
          {tonight ? "Geen plannen vanavond" : "Geen openbare plannen gevonden"}
        </p>
        <p className="text-gray-600 text-sm mt-1">
          {tonight
            ? "Maak zelf een plan of kijk later terug"
            : "Wees de eerste die een filmplan deelt!"}
        </p>
      </div>
      <Link
        href="/plans/new"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
      >
        Plan aanmaken
      </Link>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
        <Film className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="text-gray-400 font-medium">Er ging iets mis</p>
        <p className="text-gray-600 text-sm mt-1">
          Probeer de pagina te verversen
        </p>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-24 bg-surface-elevated rounded-full animate-pulse" />
      <div className="h-8 w-20 bg-surface-elevated rounded-full animate-pulse" />
      <div className="h-8 w-32 bg-surface-elevated rounded-full animate-pulse" />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface-elevated border border-white/10 rounded-2xl h-36 animate-pulse"
        />
      ))}
    </div>
  );
}
