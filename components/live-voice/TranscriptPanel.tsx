import type { TranscriptEntry } from "@/lib/live-voice/types";

export function TranscriptPanel({
  entries,
  interimText,
}: {
  entries: TranscriptEntry[];
  interimText: string;
}) {
  if (entries.length === 0 && !interimText) {
    return (
      <section className="mx-4 mt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Captured Updates
        </p>
        <p className="mt-1 text-[12.5px] text-slate-400">
          Nothing captured yet. Start listening or add a clinical update below.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Captured Updates
      </p>
      <ul className="mt-1 space-y-1.5">
        {entries.map((e) => (
          <li key={e.id} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {e.source === "voice" ? "Voice Update" : "Manual Update"}
              </span>
              <span className="text-[10px] tabular-nums text-slate-400">{e.timestamp}</span>
            </div>
            <p className="mt-0.5 text-[13px] leading-snug text-slate-800">"{e.text}"</p>
          </li>
        ))}
        {interimText ? (
          <li className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Listening…
            </span>
            <p className="mt-0.5 text-[13px] italic leading-snug text-slate-500">"{interimText}"</p>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
