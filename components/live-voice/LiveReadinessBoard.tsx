import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDot,
  Droplet,
  HeartPulse,
  MapPin,
  MinusCircle,
  Truck,
  Wind,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { deriveCardStatus } from "@/lib/live-voice/patientContext";
import type {
  CardDerivedStatus,
  LiveCategoryState,
  Subrequirement,
} from "@/lib/live-voice/types";
import type { ReadinessCategoryId } from "@/lib/transition-readiness/types";

const CATEGORY_ICONS: Record<ReadinessCategoryId, LucideIcon> = {
  airway: Wind,
  infusions: Droplet,
  transport: Truck,
  cardiac_device: HeartPulse,
  monitoring: Activity,
  destination: MapPin,
};

const CARD_STATUS_META: Record<
  CardDerivedStatus,
  { label: (idle: string) => string; chip: string; border: string }
> = {
  idle: {
    label: (idle) => idle,
    chip: "bg-amber-50 text-amber-800 border-amber-300",
    border: "border-slate-200",
  },
  in_progress: {
    label: () => "In progress",
    chip: "bg-amber-50 text-amber-800 border-amber-300",
    border: "border-slate-200",
  },
  blocked: {
    label: () => "Blocked",
    chip: "bg-red-50 text-red-700 border-red-300",
    border: "border-red-300",
  },
  contradictory: {
    label: () => "Contradictory",
    chip: "bg-red-50 text-red-700 border-red-300",
    border: "border-red-300",
  },
  ready: {
    label: () => "Ready",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-300",
    border: "border-emerald-300",
  },
};

const ITEM_META: Record<
  Subrequirement["state"],
  { Icon: LucideIcon; iconClass: string; textClass: string }
> = {
  known: { Icon: CircleDot, iconClass: "text-slate-400", textClass: "text-slate-600" },
  pending: { Icon: Circle, iconClass: "text-amber-500", textClass: "text-slate-800" },
  confirmed: { Icon: CheckCircle2, iconClass: "text-emerald-600", textClass: "text-emerald-800" },
  blocked: { Icon: AlertTriangle, iconClass: "text-red-600", textClass: "text-red-700" },
  contradictory: { Icon: XCircle, iconClass: "text-red-600", textClass: "text-red-700" },
  not_applicable: { Icon: MinusCircle, iconClass: "text-slate-300", textClass: "text-slate-400" },
};

function provenanceChip(s: Subrequirement): string {
  if (s.provenance === "chart") return "Chart";
  const src =
    s.provenance === "voice" ? "Voice" : s.provenance === "service" ? "Service" : "Typed";
  return s.updatedAt ? `${src} · ${s.updatedAt}` : src;
}

function SubreqRow({ item }: { item: Subrequirement }) {
  const meta = ITEM_META[item.state];
  return (
    <li className="flex items-start justify-between gap-2 py-1">
      <span className="flex min-w-0 items-start gap-1.5">
        <meta.Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${meta.iconClass}`} aria-hidden />
        <span className="min-w-0">
          <span className={`block text-[12.5px] leading-snug ${meta.textClass} ${item.state === "not_applicable" ? "line-through" : ""}`}>
            {item.label}
          </span>
          {item.evidenceClause ? (
            <span className="block truncate text-[10.5px] italic leading-snug text-slate-400">
              "{item.evidenceClause}"
            </span>
          ) : null}
        </span>
      </span>
      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9.5px] font-medium text-slate-500">
        {provenanceChip(item)}
      </span>
    </li>
  );
}

export function LiveReadinessBoard({ categories }: { categories: LiveCategoryState[] }) {
  return (
    <section aria-label="Patient-specific readiness checklist" className="mx-4 mt-3 space-y-2">
      <p className="text-[10px] text-slate-400">
        Chart-known · <span className="text-emerald-700">Confirmed</span> ·{" "}
        <span className="text-amber-700">Pending</span> ·{" "}
        <span className="text-red-600">Blocked / Contradictory</span> · N/A
      </p>
      {categories.map((cat) => {
        const status = deriveCardStatus(cat);
        const meta = CARD_STATUS_META[status];
        const Icon = CATEGORY_ICONS[cat.id];
        return (
          <div
            key={cat.id}
            className={`rounded-lg border bg-white px-3 py-2 transition-colors duration-500 motion-reduce:transition-none ${meta.border}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-slate-500" aria-hidden />
                <span className="text-[13.5px] font-semibold text-slate-900">{cat.label}</span>
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10.5px] font-semibold ${meta.chip}`}
              >
                {meta.label(cat.idleLabel)}
              </span>
            </div>
            <ul className="mt-1 divide-y divide-slate-50">
              {cat.subreqs.map((item) => (
                <SubreqRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
