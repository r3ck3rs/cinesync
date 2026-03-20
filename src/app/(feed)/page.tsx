import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">🎬 CineSync</h1>
          <span className="text-sm text-gray-400">{user.email}</span>
        </div>
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎟️</p>
          <h2 className="text-xl font-semibold mb-2">Nog geen plannen</h2>
          <p className="text-gray-400 mb-6">Maak een plan aan of wacht tot vrienden er een delen.</p>
          <a href="/plans/new" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors">
            + Plan aanmaken
          </a>
        </div>
      </div>
    </main>
  );
}
