export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

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
        {/* Tonight filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["Vanavond 🌙", "Dit weekend", "Alle", "Vrienden", "Populair"].map((filter, i) => (
            <button
              key={filter}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-purple-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Empty state */}
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
