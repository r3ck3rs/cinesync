export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PlansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/feed" className="text-gray-400 text-sm hover:text-white">
              ← Feed
            </Link>
            <h1 className="text-2xl font-bold mt-1">🎟️ Mijn Plans</h1>
          </div>
          <Link
            href="/plans/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            + Nieuw plan
          </Link>
        </div>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-800 pb-2">
            <button className="text-white border-b-2 border-purple-500 pb-2 px-1 text-sm font-medium">
              Aankomend
            </button>
            <button className="text-gray-400 hover:text-white pb-2 px-1 text-sm">
              Geweest
            </button>
            <button className="text-gray-400 hover:text-white pb-2 px-1 text-sm">
              Mijn aangemaakt
            </button>
          </div>

          {/* Empty state */}
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍿</p>
            <h2 className="text-xl font-semibold mb-2">Nog geen plans</h2>
            <p className="text-gray-400 mb-6">
              Maak je eerste plan aan of join een plan van een vriend.
            </p>
            <Link
              href="/plans/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              + Plan aanmaken
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
