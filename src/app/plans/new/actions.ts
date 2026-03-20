"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PlanInsert = Database["public"]["Tables"]["plans"]["Insert"];

export interface CreatePlanData {
  movieId: number;
  movieTitle: string;
  moviePosterPath: string | null;
  cinemaId: string;
  cinemaName: string;
  cinemaAddress: string;
  showtimeId: string;
  scheduledAt: string;
  isPublic: boolean;
  maxSpots: number;
  notes: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  planId?: string;
}

export async function createPlan(data: CreatePlanData): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je moet ingelogd zijn om een plan te maken" };
  }

  const title = `${data.movieTitle} @ ${data.cinemaName}`;

  const planData: PlanInsert = {
    created_by: user.id,
    title,
    tmdb_movie_id: data.movieId,
    movie_title: data.movieTitle,
    movie_poster_path: data.moviePosterPath,
    cinema_id: data.cinemaId,
    cinema_name: data.cinemaName,
    location: data.cinemaAddress,
    scheduled_at: data.scheduledAt,
    is_public: data.isPublic,
    max_spots: data.maxSpots,
    notes: data.notes || null,
    status: "planning",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plansTable = supabase.from("plans") as any;
  const { data: plan, error } = await plansTable
    .insert(planData)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create plan:", error);
    return { success: false, error: "Kon plan niet aanmaken. Probeer het opnieuw." };
  }

  const planId = (plan as { id: string }).id;

  revalidatePath("/plans");
  redirect(`/plans/${planId}`);
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
