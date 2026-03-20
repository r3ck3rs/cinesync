import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import ProfileForm from "./profile-form";

export const metadata = {
  title: "Profiel",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await getProfile(user.id);

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Profiel</h1>
        <p className="text-gray-400 mt-1">Beheer je accountgegevens</p>
      </header>

      <ProfileForm profile={profile} email={user.email || ""} />
    </main>
  );
}
