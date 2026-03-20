export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getPosterUrl } from "@/lib/tmdb";

interface Plan {
  id: string;
  movie_title: string;
  movie_poster_path: string | null;
  movie_year: string;
  cinema: string;
  showtime: string;
  audience: string;
  note: string | null;
  creator_id: string;
  plan_members: { count: number }[];
}

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: plans } = await supabase
    .from("plans")
    .select("*, plan_members(count)")
    .eq("status", "open")
    .gte("showtime", new Date().toISOString())
    .order("showtime", { ascending: true })
    .limit(20);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString())
      return `Vanavond ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    if (d.toDateString() === tomorrow.toDateString())
      return `Morgen ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-gray-900 px-6 py-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">🎬 CineSync</h1>
          <Link href="/plans/new">
            <span className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              + Plan
            </span>
          </Link>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["Vanavond 🌙", "Dit weekend", "Alle", "Vrienden", "Populair"].map((filter, i) => (
            <button
              key={filter}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0 ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Plans */}
        {plans && plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan: Plan) => (
              <div
                key={plan.id}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  {plan.movie_poster_path ? (
                    <Image
                      src={getPosterUrl(plan.movie_poster_path, "w185")}
                      alt={plan.movie_title}
                      width={64}
                      height={96}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight">{plan.movie_title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{plan.cinema}</p>
                    <p className="text-sm text-purple-400 font-medium mt-1">{formatDate(plan.showtime)}</p>
                    {plan.note && (
                      <p className="text-sm text-gray-400 mt-2 italic">"{plan.note}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-500">
                        👥 {plan.plan_members?.[0]?.count ?? 1} gaan mee
                      </span>
                      <span className="text-xs text-gray-600">
                        {plan.audience === "public" ? "🌍" : plan.audience === "extended" ? "🌐" : "👥"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  {plan.creator_id !== user.id ? (
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                      🎟️ Meedoen
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Jouw plan</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎟️</p>
            <h2 className="text-xl font-semibold mb-2">Geen plans vanavond</h2>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
              Wees de eerste! Maak een plan aan en kijk wie er meegaat.
            </p>
            <Link
              href="/plans/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              + Plan aanmaken
            </Link>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-gray-900 px-6 py-3 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <Link href="/feed" className="flex flex-col items-center gap-1 text-purple-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/plans" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">🎟️</span>
            <span className="text-xs">Plans</span>
          </Link>
          <Link href="/plans/new" className="flex flex-col items-center gap-1">
            <span className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-lg transition-colors">+</span>
          </Link>
          <Link href="/friends" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">👥</span>
            <span className="text-xs">Vrienden</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-xs">Profiel</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
