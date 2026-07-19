import type { AppliedUpdate, SubreqState } from "@/lib/live-voice/types";

const STATE_LABELS: Record<SubreqState, { text: string; cls: string }> = {
  known: { text: "Known", cls: "text-slate-500" },
  pending: { text: "Pending", cls: "text-amber-700" },
  confirmed: { text: "Confirmed", cls: "text-emerald-700" },
  blocked: { text: "Still blocked", cls: "text-red-700" },
  contradictory: { text: "Contradicts expected state", cls: "text-red-700" },
  not_applicable: { text: "Not applicable", cls: "text-slate-500" },
};

export function UpdatesFeed({ updates }: { updates: AppliedUpdate[] }) {
  if (updates.length === 0) return null;
  const recent = [...updates].reverse().slice(0, 8);
  return (
    <section aria-label="Checklist updates" className="mx-4 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Checklist updates
      </p>
      <ul className="mt-1 space-y-1.5">
        {recent.map((u) => {
          const meta = STATE_LABELS[u.newState];
          return (
            <li key={u.id} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-semibold text-slate-800">
                  {u.categoryLabel} · {u.subreqLabel}
                </span>
                <span className={`shrink-0 text-[11.5px] font-semibold ${meta.cls}`}>
                  {meta.text}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] italic leading-snug text-slate-500">
                "{u.clause}"
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {u.source === "voice"
                  ? "Voice Update"
                  : u.source === "service"
                    ? "Service Response"
                    : "Manual Update"}{" "}
                · {u.timestamp} · Confidence {u.confidence}%
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
