"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface CreatePlanInput {
  movieId: number;
  movieTitle: string;
  moviePosterPath: string | null;
  movieYear: string;
  cinema: string;
  date: string;
  time: string;
  audience: "friends" | "extended" | "public";
  note: string;
}

export async function createPlan(input: CreatePlanInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const showtime = new Date(`${input.date}T${input.time}:00`).toISOString();

  const { data, error } = await supabase
    .from("plans")
    .insert({
      creator_id: user.id,
      movie_id: input.movieId,
      movie_title: input.movieTitle,
      movie_poster_path: input.moviePosterPath,
      movie_year: input.movieYear,
      cinema: input.cinema,
      showtime,
      audience: input.audience,
      note: input.note || null,
      status: "open",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Auto-join as creator
  await supabase.from("plan_members").insert({
    plan_id: data.id,
    user_id: user.id,
  });

  redirect("/feed");
}
