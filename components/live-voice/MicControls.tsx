import { Mic, Pause, Square } from "lucide-react";
import type { ListeningState } from "@/lib/live-voice/types";

const STATE_META: Record<ListeningState, { label: string; dot: string; text: string }> = {
  idle: { label: "Not started", dot: "bg-slate-300", text: "text-slate-500" },
  requesting: { label: "Requesting microphone…", dot: "bg-amber-400", text: "text-amber-700" },
  listening: { label: "Listening", dot: "bg-emerald-500", text: "text-emerald-700" },
  paused: { label: "Paused", dot: "bg-amber-400", text: "text-amber-700" },
  stopped: { label: "Stopped", dot: "bg-slate-300", text: "text-slate-500" },
  error: { label: "Microphone unavailable", dot: "bg-red-500", text: "text-red-700" },
  unsupported: { label: "Speech recognition unsupported", dot: "bg-slate-300", text: "text-slate-500" },
};

export function MicControls({
  listeningState,
  errorMessage,
  supported,
  onStart,
  onPause,
  onStop,
}: {
  listeningState: ListeningState;
  errorMessage: string | null;
  supported: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}) {
  const meta = STATE_META[listeningState];
  const isListening = listeningState === "listening";
  const isPaused = listeningState === "paused";
  const canStop = isListening || isPaused;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
        <span className={`text-[12.5px] font-semibold ${meta.text}`}>{meta.label}</span>
      </div>

      {!supported ? (
        <p className="mt-1 text-[11.5px] leading-snug text-slate-500">
          This browser doesn't support live speech recognition. Use the transcript field below.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-1 text-[11.5px] leading-snug text-red-600">{errorMessage}</p>
      ) : null}

      <div className="mt-2 flex gap-2">
        {!isListening ? (
          <button
            type="button"
            onClick={onStart}
            disabled={!supported}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-navy-800 px-3 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            <Mic className="h-4 w-4" aria-hidden />
            {isPaused ? "Resume Listening" : "Start Listening"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-700"
          >
            <Pause className="h-4 w-4" aria-hidden />
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={onStop}
          disabled={!canStop}
          aria-label="Stop listening"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-slate-700 disabled:opacity-30"
        >
          <Square className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
