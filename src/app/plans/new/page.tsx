import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PlanForm } from "./plan-form";

export const metadata: Metadata = {
  title: "Nieuw plan",
  description: "Maak een nieuw filmplan aan en nodig vrienden uit",
};

export default async function NewPlanPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/plans/new");
  }

  return <PlanForm />;
}
