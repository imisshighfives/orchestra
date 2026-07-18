import type { ActivityEvent } from "@/lib/transition-readiness/types";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section aria-label="Agent activity" className="mx-4 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Activity</p>
      <ul className="mt-1 space-y-1">
        {events.map((e) => (
          <li key={`${e.time}-${e.text}`} className="flex items-baseline gap-2 text-[12.5px] text-slate-600">
            <span className="shrink-0 tabular-nums text-slate-400">{e.time}</span>
            <span className="min-w-0 truncate">{e.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
