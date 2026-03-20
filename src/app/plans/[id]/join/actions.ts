"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface JoinResult {
  success: boolean;
  error?: string;
  status?: "accepted" | "pending";
}

interface PlanData {
  id: string;
  is_public: boolean;
  max_spots: number | null;
  status: string;
  created_by: string;
}

interface MemberData {
  id: string;
  rsvp: string;
  role?: string;
}

export async function joinPlan(planId: string): Promise<JoinResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je moet ingelogd zijn om deel te nemen" };
  }

  // Fetch plan details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plansTable = supabase.from("plans") as any;
  const { data: plan, error: planError } = await plansTable
    .select("id, is_public, max_spots, status, created_by")
    .eq("id", planId)
    .single();

  if (planError || !plan) {
    return { success: false, error: "Plan niet gevonden" };
  }

  const typedPlan = plan as PlanData;

  // Check if plan is active
  if (typedPlan.status === "cancelled") {
    return { success: false, error: "Dit plan is geannuleerd" };
  }

  if (typedPlan.status === "done") {
    return { success: false, error: "Dit plan is al afgelopen" };
  }

  // Check if user is already a member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersTable = supabase.from("plan_members") as any;
  const { data: existingMember } = await membersTable
    .select("id, rsvp")
    .eq("plan_id", planId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    const typedMember = existingMember as MemberData;
    if (typedMember.rsvp === "accepted") {
      return { success: false, error: "Je doet al mee aan dit plan" };
    }
    if (typedMember.rsvp === "pending") {
      return { success: false, error: "Je verzoek wacht nog op goedkeuring" };
    }
    if (typedMember.rsvp === "declined") {
      return { success: false, error: "Je verzoek is eerder afgewezen" };
    }
  }

  // Check capacity
  if (typedPlan.max_spots !== null) {
    const { count: memberCount } = await membersTable
      .select("id", { count: "exact", head: true })
      .eq("plan_id", planId)
      .eq("rsvp", "accepted");

    if (memberCount !== null && memberCount >= typedPlan.max_spots) {
      return { success: false, error: "Dit plan is vol" };
    }
  }

  // Determine initial RSVP status
  // Public plans: auto-accept
  // Private plans: pending approval from owner
  const initialRsvp: "accepted" | "pending" = typedPlan.is_public ? "accepted" : "pending";

  // Add user to plan_members
  const { error: insertError } = await membersTable.insert({
    plan_id: planId,
    user_id: user.id,
    role: "member",
    rsvp: initialRsvp,
  });

  if (insertError) {
    console.error("Failed to join plan:", insertError);
    if (insertError.code === "23505") {
      return { success: false, error: "Je bent al lid van dit plan" };
    }
    return { success: false, error: "Kon niet deelnemen. Probeer het opnieuw." };
  }

  revalidatePath(`/plans/${planId}`);

  return {
    success: true,
    status: initialRsvp,
  };
}

export async function joinPlanAndRedirect(planId: string): Promise<void> {
  const result = await joinPlan(planId);

  if (!result.success) {
    redirect(`/plans/${planId}/join?error=${encodeURIComponent(result.error || "Onbekende fout")}`);
  }

  redirect(`/plans/${planId}?joined=${result.status}`);
}

export async function approveMember(
  planId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je moet ingelogd zijn" };
  }

  // Check if current user is the plan owner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plansTable = supabase.from("plans") as any;
  const { data: plan } = await plansTable
    .select("created_by, max_spots")
    .eq("id", planId)
    .single();

  const typedPlan = plan as { created_by: string; max_spots: number | null } | null;

  if (!typedPlan || typedPlan.created_by !== user.id) {
    return { success: false, error: "Alleen de organisator kan leden goedkeuren" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersTable = supabase.from("plan_members") as any;

  // Check capacity before approving
  if (typedPlan.max_spots !== null) {
    const { count: memberCount } = await membersTable
      .select("id", { count: "exact", head: true })
      .eq("plan_id", planId)
      .eq("rsvp", "accepted");

    if (memberCount !== null && memberCount >= typedPlan.max_spots) {
      return { success: false, error: "Het plan is vol, kan niet meer leden toevoegen" };
    }
  }

  // Update member status
  const { error } = await membersTable
    .update({ rsvp: "accepted" })
    .eq("id", memberId)
    .eq("plan_id", planId);

  if (error) {
    console.error("Failed to approve member:", error);
    return { success: false, error: "Kon lid niet goedkeuren" };
  }

  revalidatePath(`/plans/${planId}`);
  return { success: true };
}

export async function declineMember(
  planId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je moet ingelogd zijn" };
  }

  // Check if current user is the plan owner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plansTable = supabase.from("plans") as any;
  const { data: plan } = await plansTable
    .select("created_by")
    .eq("id", planId)
    .single();

  const typedPlan = plan as { created_by: string } | null;

  if (!typedPlan || typedPlan.created_by !== user.id) {
    return { success: false, error: "Alleen de organisator kan leden afwijzen" };
  }

  // Update member status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersTable = supabase.from("plan_members") as any;
  const { error } = await membersTable
    .update({ rsvp: "declined" })
    .eq("id", memberId)
    .eq("plan_id", planId);

  if (error) {
    console.error("Failed to decline member:", error);
    return { success: false, error: "Kon lid niet afwijzen" };
  }

  revalidatePath(`/plans/${planId}`);
  return { success: true };
}

export async function leavePlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Je moet ingelogd zijn" };
  }

  // Check if user is the owner (owners can't leave)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersTable = supabase.from("plan_members") as any;
  const { data: membership } = await membersTable
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", user.id)
    .single();

  const typedMembership = membership as { role: string } | null;

  if (!typedMembership) {
    return { success: false, error: "Je bent geen lid van dit plan" };
  }

  if (typedMembership.role === "owner") {
    return { success: false, error: "Als organisator kun je niet vertrekken. Annuleer het plan of draag het over." };
  }

  // Delete membership
  const { error } = await membersTable
    .delete()
    .eq("plan_id", planId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to leave plan:", error);
    return { success: false, error: "Kon plan niet verlaten" };
  }

  revalidatePath(`/plans/${planId}`);
  return { success: true };
}
