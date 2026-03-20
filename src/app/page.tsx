import { createClient } from "@/lib/supabase/server";
import { Film, Users, Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const { data: plansData } = await supabase
    .from("plans")
    .select("id, title, scheduled_at, location, plan_members(count)")
    .eq("created_by", user.id)
    .order("scheduled_at", { ascending: true })
    .limit(10);

  const plans = plansData as PlanWithMembers[] | null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <Link
          href="/plans/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          + Plan
        </Link>
      </header>

      {plans && plans.length > 0 ? (
        <section className="space-y-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </section>
      ) : (
        <EmptyFeed />
      )}
    </main>
  );
}

interface PlanWithMembers {
  id: string;
  title: string;
  scheduled_at: string | null;
  location: string | null;
  plan_members: { count: number }[];
}

function PlanCard({ plan }: { plan: PlanWithMembers }) {
  const scheduledAt = plan.scheduled_at
    ? new Date(plan.scheduled_at)
    : null;

  return (
    <Link href={`/plans/${plan.id}`}>
      <article className="bg-surface-elevated border border-white/10 rounded-2xl p-4 hover:border-brand-600/50 transition-colors space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0">
            <Film className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">
              {plan.title}
            </h2>
            {scheduledAt && (
              <p className="text-sm text-gray-400 mt-0.5">
                {scheduledAt.toLocaleDateString("nl-NL", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {plan.plan_members?.[0]?.count ?? 1} deelnemers
          </span>
          {plan.location && (
            <span className="truncate">{plan.location}</span>
          )}
        </div>
      </article>
    </Link>
  );
}

function EmptyFeed() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto">
        <Film className="w-8 h-8 text-gray-600" />
      </div>
      <div>
        <p className="text-gray-400 font-medium">Geen plannen nog</p>
        <p className="text-gray-600 text-sm mt-1">
          Maak je eerste filmplan aan
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
