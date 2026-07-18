import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  Droplet,
  HeartPulse,
  MapPin,
  Truck,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { STATUS_META } from "@/lib/transition-readiness/statusMeta";
import type { ReadinessCategoryId, ReadinessItem, ReadinessStatus } from "@/lib/transition-readiness/types";

const CATEGORY_ICONS: Record<ReadinessCategoryId, LucideIcon> = {
  airway: Wind,
  infusions: Droplet,
  transport: Truck,
  cardiac_device: HeartPulse,
  monitoring: Activity,
  destination: MapPin,
};

const STATUS_ICONS: Record<ReadinessStatus, LucideIcon> = {
  not_evaluated: Circle,
  in_progress: Clock3,
  pending_verification: AlertTriangle,
  complete: CheckCircle2,
};

export function ReadinessGrid({ items }: { items: ReadinessItem[] }) {
  return (
    <section aria-label="Readiness categories" className="mx-4 mt-3 grid grid-cols-2 gap-2">
      {items.map((it) => {
        const CategoryIcon = CATEGORY_ICONS[it.id];
        const StatusIcon = STATUS_ICONS[it.status];
        const meta = STATUS_META[it.status];
        return (
          <div
            key={it.id}
            className={`rounded-xl border px-2.5 py-2 transition-colors duration-500 motion-reduce:transition-none ${meta.bgClass} ${meta.borderClass}`}
          >
            <div className="flex items-center gap-1.5 text-slate-600">
              <CategoryIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate text-[12.5px] font-semibold text-slate-800">{it.label}</span>
            </div>
            <div className={`mt-1 flex items-start gap-1 text-[12px] font-medium leading-snug ${meta.textClass}`}>
              <StatusIcon className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{meta.label}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
