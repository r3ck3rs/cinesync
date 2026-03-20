"use client";

import { useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { joinPlanAndRedirect } from "./actions";

interface JoinButtonProps {
  planId: string;
  isPublic: boolean;
}

export function JoinButton({ planId, isPublic }: JoinButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      await joinPlanAndRedirect(planId);
    });
  };

  return (
    <button
      onClick={handleJoin}
      disabled={isPending}
      className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold py-4 rounded-xl transition-colors"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Even geduld...
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          {isPublic ? "Deelnemen" : "Verzoek versturen"}
        </>
      )}
    </button>
  );
}
