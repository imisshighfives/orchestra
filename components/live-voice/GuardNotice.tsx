import { ShieldAlert } from "lucide-react";
import type { GuardedStatement } from "@/lib/live-voice/types";

export function GuardNotice({ guard }: { guard: GuardedStatement }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Not recorded as readiness
        </span>
      </div>
      <p className="mt-1 text-[12.5px] italic leading-snug text-slate-600">"{guard.heardText}"</p>
      <p className="mt-1 text-[12.5px] font-medium leading-snug text-amber-800">{guard.message}</p>
    </div>
  );
}
