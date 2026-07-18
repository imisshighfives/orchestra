"use client";

import { LiveVoiceScreen } from "@/components/live-voice/LiveVoiceScreen";
import { AppTopBar } from "./AppTopBar";

export function TransitionReadinessApp() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-slate-50">
      <AppTopBar />

      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[17px] font-bold text-slate-900">Orchestra</h1>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
            MRI Readiness
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <LiveVoiceScreen />
      </div>
    </div>
  );
}
