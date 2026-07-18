"use client";

import { getPhaseSnapshot } from "@/lib/transition-readiness/timeline";
import { useDemoEngine } from "@/lib/transition-readiness/useDemoEngine";
import { ActivityFeed } from "./ActivityFeed";
import { DemoControls } from "./DemoControls";
import { DetailSlot } from "./DetailSlot";
import { PatientHeader } from "./PatientHeader";
import { PrimaryStatus } from "./PrimaryStatus";
import { ReadinessGrid } from "./ReadinessGrid";

const CLINICAL_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function TransitionReadinessScreen() {
  const engine = useDemoEngine();
  const snapshot = getPhaseSnapshot(engine.phaseIndex);

  return (
    <div
      className="mx-auto flex h-full w-full max-w-[430px] flex-col bg-white text-slate-900"
      style={{ fontFamily: CLINICAL_FONT }}
    >
      <PatientHeader showMriTag={snapshot.showMriTag} />

      <div className="flex-1 overflow-y-auto pb-1">
        <PrimaryStatus status={snapshot.primaryStatus} />
        <DetailSlot slot={snapshot.detailSlot} reducedMotion={engine.prefersReducedMotion} />
        <ReadinessGrid items={snapshot.readiness} />
        <ActivityFeed events={snapshot.activity} />
      </div>

      <DemoControls engine={engine} />
      <p className="pb-1.5 text-center text-[9px] text-slate-300">
        Synthetic demo data · no real patient information
      </p>
    </div>
  );
}
