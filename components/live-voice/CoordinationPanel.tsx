import { CheckCircle2, Send } from "lucide-react";
import type { VerificationRequest } from "@/lib/live-voice/types";

/**
 * Shows the agent's outbound verification request lifecycle:
 * routed (awaiting response) → responded. Responses are simulated —
 * the panel says so explicitly.
 */
export function CoordinationPanel({ request }: { request: VerificationRequest }) {
  if (request.status === "routed") {
    return (
      <div className="mx-4 mt-3 rounded-md border border-navy-100 bg-navy-50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5 shrink-0 text-navy-700" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-wide text-navy-700">
            Verification request routed
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] font-medium text-navy-800">{request.target}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-navy-700">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 motion-reduce:animate-none" aria-hidden />
          Awaiting response · routed {request.routedAt}
        </p>
        <p className="mt-0.5 text-[9.5px] text-slate-400">Simulated service — no real integration</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
        <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          {request.target} responded
        </span>
      </div>
      {request.responseNote ? (
        <p className="mt-0.5 text-[12.5px] font-medium text-emerald-800">{request.responseNote}</p>
      ) : null}
      <p className="mt-0.5 text-[11.5px] text-emerald-700">
        Routed {request.routedAt} · responded {request.respondedAt}
      </p>
      <p className="mt-0.5 text-[9.5px] text-slate-400">Simulated service — no real integration</p>
    </div>
  );
}
