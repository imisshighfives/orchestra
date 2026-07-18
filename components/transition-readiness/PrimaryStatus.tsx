import { AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import type { PrimaryStatus as PrimaryStatusType } from "@/lib/transition-readiness/types";

const TONE_STYLES = {
  neutral: {
    wrap: "bg-slate-50 border-slate-200",
    eyebrow: "text-slate-500",
    title: "text-slate-900",
    icon: "text-slate-400",
  },
  amber: {
    wrap: "bg-amber-50 border-amber-300",
    eyebrow: "text-amber-700",
    title: "text-amber-900",
    icon: "text-amber-600",
  },
  green: {
    wrap: "bg-emerald-50 border-emerald-300",
    eyebrow: "text-emerald-700",
    title: "text-emerald-900",
    icon: "text-emerald-600",
  },
} as const;

export function PrimaryStatus({ status }: { status: PrimaryStatusType }) {
  const styles = TONE_STYLES[status.tone];
  const Icon = status.tone === "green" ? CheckCircle2 : status.tone === "amber" ? AlertTriangle : CircleDot;

  return (
    <section
      role="status"
      aria-live="polite"
      className={`mx-4 mt-3 rounded-2xl border px-4 py-3.5 transition-colors duration-500 motion-reduce:transition-none ${styles.wrap}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden />
        <div className="min-w-0">
          {status.eyebrow ? (
            <p className={`text-[11px] font-bold tracking-wide ${styles.eyebrow}`}>{status.eyebrow}</p>
          ) : null}
          <p className={`text-[20px] font-bold leading-snug ${styles.title}`}>{status.title}</p>
          {status.subtitle ? (
            <p className={`mt-0.5 text-[14px] font-medium ${styles.eyebrow}`}>{status.subtitle}</p>
          ) : null}
          {status.meta ? <p className="mt-1 text-[13px] text-slate-600">{status.meta}</p> : null}
          {status.tone === "green" ? (
            <p className="mt-2 border-t border-emerald-200 pt-2 text-[12.5px] leading-snug text-emerald-800">
              Final bedside clinical assessment remains with the care team.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
