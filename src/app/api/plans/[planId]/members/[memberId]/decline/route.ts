import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    planId: string;
    memberId: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { planId, memberId } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Niet ingelogd" },
      { status: 401 }
    );
  }

  // Check if current user is the plan owner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plansTable = supabase.from("plans") as any;
  const { data: plan } = await plansTable
    .select("created_by")
    .eq("id", planId)
    .single();

  const typedPlan = plan as { created_by: string } | null;

  if (!typedPlan) {
    return NextResponse.json(
      { error: "Plan niet gevonden" },
      { status: 404 }
    );
  }

  if (typedPlan.created_by !== user.id) {
    return NextResponse.json(
      { error: "Alleen de organisator kan leden afwijzen" },
      { status: 403 }
    );
  }

  // Update member status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const membersTable = supabase.from("plan_members") as any;
  const { error } = await membersTable
    .update({ rsvp: "declined" })
    .eq("id", memberId)
    .eq("plan_id", planId)
    .eq("rsvp", "pending");

  if (error) {
    console.error("Failed to decline member:", error);
    return NextResponse.json(
      { error: "Kon lid niet afwijzen" },
      { status: 500 }
    );
  }

  revalidatePath(`/plans/${planId}`);

  // Redirect back to plan page
  return NextResponse.redirect(new URL(`/plans/${planId}`, request.url));
}
