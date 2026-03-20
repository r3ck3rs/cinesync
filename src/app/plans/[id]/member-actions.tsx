"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { approveMember, declineMember, leavePlan } from "./join/actions";
import { useRouter } from "next/navigation";

interface MemberActionsProps {
  planId: string;
  memberId: string;
}

export function ApproveMemberButton({ planId, memberId }: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveMember(planId, memberId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
      title="Goedkeuren"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Check className="w-4 h-4" />
      )}
    </button>
  );
}

export function DeclineMemberButton({ planId, memberId }: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDecline = () => {
    startTransition(async () => {
      const result = await declineMember(planId, memberId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleDecline}
      disabled={isPending}
      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
      title="Afwijzen"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <X className="w-4 h-4" />
      )}
    </button>
  );
}

interface LeavePlanButtonProps {
  planId: string;
}

export function LeavePlanButton({ planId }: LeavePlanButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLeave = () => {
    if (!confirm("Weet je zeker dat je dit plan wilt verlaten?")) {
      return;
    }

    startTransition(async () => {
      const result = await leavePlan(planId);
      if (result.success) {
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleLeave}
      disabled={isPending}
      className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 rounded-xl border border-red-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Even geduld...
        </>
      ) : (
        <>
          <X className="w-4 h-4" />
          Plan verlaten
        </>
      )}
    </button>
  );
}
