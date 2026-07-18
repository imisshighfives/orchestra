"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function TextFallbackInput({
  emphasized,
  onSubmit,
}: {
  emphasized: boolean;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className={`shrink-0 border-b px-4 py-2 ${emphasized ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <label htmlFor="transcript-fallback" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {emphasized ? "Add Clinical Update (speech recognition unavailable)" : "Add Clinical Update"}
      </label>
      <div className="mt-1 flex gap-2">
        <textarea
          id="transcript-fallback"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter or dictate a bedside update…"
          rows={2}
          className="min-h-11 flex-1 resize-none rounded-md border border-slate-300 bg-white px-2.5 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-navy-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          aria-label="Submit transcript"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-navy-800 text-white disabled:opacity-30"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
