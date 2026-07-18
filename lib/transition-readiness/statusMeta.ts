import type { ReadinessCategoryId, ReadinessStatus } from "./types";

export const STATUS_META: Record<
  ReadinessStatus,
  { label: string; textClass: string; bgClass: string; borderClass: string; dotClass: string }
> = {
  not_evaluated: {
    label: "Not evaluated",
    textClass: "text-slate-500",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
    dotClass: "bg-slate-300",
  },
  in_progress: {
    label: "In progress",
    textClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
    dotClass: "bg-slate-400",
  },
  pending_verification: {
    label: "Pending verification",
    textClass: "text-amber-800",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-300",
    dotClass: "bg-amber-500",
  },
  complete: {
    label: "Complete",
    textClass: "text-emerald-800",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-300",
    dotClass: "bg-emerald-500",
  },
};

export const CATEGORY_ORDER: ReadinessCategoryId[] = [
  "airway",
  "infusions",
  "transport",
  "cardiac_device",
  "monitoring",
  "destination",
];
