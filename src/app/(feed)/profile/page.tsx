export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/feed" className="text-gray-400 hover:text-white">
            ← Feed
          </Link>
          <h1 className="text-xl font-bold">Profiel</h1>
          <div className="w-16" />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {initials}
          </div>
          <p className="text-lg font-semibold">{user.email}</p>
          <p className="text-sm text-gray-400 mt-1">Lid sinds {new Date(user.created_at).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Plans", value: "0" },
            { label: "Vrienden", value: "0" },
            { label: "Films", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/plans"
            className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-4 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span>🎟️</span>
              <span>Mijn plans</span>
            </span>
            <span className="text-gray-500">→</span>
          </Link>

          <button className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-4 transition-colors">
            <span className="flex items-center gap-3">
              <span>👥</span>
              <span>Vrienden</span>
            </span>
            <span className="text-gray-500">→</span>
          </button>

          <button className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-4 transition-colors">
            <span className="flex items-center gap-3">
              <span>🔔</span>
              <span>Notificaties</span>
            </span>
            <span className="text-gray-500">→</span>
          </button>

          <button className="flex items-center justify-between w-full bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-4 transition-colors">
            <span className="flex items-center gap-3">
              <span>⚙️</span>
              <span>Instellingen</span>
            </span>
            <span className="text-gray-500">→</span>
          </button>
        </div>

        {/* Sign out */}
        <form action="/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full border border-red-800 hover:bg-red-900/20 text-red-400 py-3 rounded-xl font-medium transition-colors"
          >
            Uitloggen
          </button>
        </form>
      </div>
    </main>
  );
}
