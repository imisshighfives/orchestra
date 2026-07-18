import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { TOTAL_PHASES } from "@/lib/transition-readiness/timeline";
import type { DemoEngine } from "@/lib/transition-readiness/useDemoEngine";

function CtrlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function DemoControls({ engine }: { engine: DemoEngine }) {
  const { started, running, finished, phaseIndex, start, pause, resume, reset, next, prev } = engine;

  return (
    <div className="flex items-center justify-between gap-1 border-t border-slate-100 px-3 py-1.5">
      <div className="flex items-center gap-0.5">
        <CtrlButton label="Previous state" onClick={prev} disabled={phaseIndex === 0}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </CtrlButton>
        <CtrlButton label="Next state" onClick={next} disabled={phaseIndex >= TOTAL_PHASES - 1}>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </CtrlButton>
        <CtrlButton label="Reset" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden />
        </CtrlButton>
      </div>

      <span className="text-[10px] font-medium tabular-nums text-slate-300">
        {phaseIndex + 1}/{TOTAL_PHASES}
      </span>

      <div className="flex items-center gap-1">
        {!started || finished ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            Start Demo
          </button>
        ) : running ? (
          <CtrlButton label="Pause" onClick={pause}>
            <Pause className="h-4 w-4" aria-hidden />
          </CtrlButton>
        ) : (
          <CtrlButton label="Resume" onClick={resume}>
            <Play className="h-4 w-4" aria-hidden />
          </CtrlButton>
        )}
      </div>
    </div>
  );
}
