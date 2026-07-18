import type {
  ActivityEvent,
  PhaseId,
  PhaseSnapshot,
  ReadinessItem,
} from "./types";

/**
 * Phase durations in seconds. Edit these to retime the demo.
 * Sum = ~55s, matching the presenter's one-minute slot.
 */
export const PHASE_DURATIONS_SEC = [5, 6, 8, 9, 11, 8, 8] as const;

/** Absolute start time (seconds from demo start) for each phase, derived from durations. */
export const PHASE_START_SEC: number[] = PHASE_DURATIONS_SEC.reduce<number[]>((acc, dur, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + PHASE_DURATIONS_SEC[i - 1]);
  return acc;
}, []);

export const PHASE_IDS: PhaseId[] = [
  "PATIENT_BASELINE",
  "TRANSITION_DETECTED",
  "CONTEXT_ANALYZED",
  "BLOCKER_IDENTIFIED",
  "BEDSIDE_UPDATE_CAPTURED",
  "DEVICE_RESPONSE_RECEIVED",
  "ALL_REQUIREMENTS_COMPLETE",
];

const OWNERS: Record<ReadinessItem["id"], string> = {
  airway: "Respiratory Therapy",
  infusions: "Bedside RN",
  transport: "Transport Team",
  cardiac_device: "Cardiac Device / EP",
  monitoring: "Bedside RN",
  destination: "Charge RN",
};

const LABELS: Record<ReadinessItem["id"], string> = {
  airway: "Airway",
  infusions: "Infusions",
  transport: "Transport",
  cardiac_device: "Cardiac Device",
  monitoring: "Monitoring",
  destination: "Destination",
};

function item(
  id: ReadinessItem["id"],
  status: ReadinessItem["status"],
  source: string,
  evidenceLabel: string,
  updatedAt: string | null,
): ReadinessItem {
  return {
    id,
    label: LABELS[id],
    status,
    source,
    owner: OWNERS[id],
    evidenceLabel,
    updatedAt,
  };
}

const READINESS_BY_PHASE: ReadinessItem[][] = [
  // 0 PATIENT_BASELINE
  [
    item("airway", "not_evaluated", "—", "No active transition", null),
    item("infusions", "not_evaluated", "—", "No active transition", null),
    item("transport", "not_evaluated", "—", "No active transition", null),
    item("cardiac_device", "not_evaluated", "—", "No active transition", null),
    item("monitoring", "not_evaluated", "—", "No active transition", null),
    item("destination", "not_evaluated", "—", "No active transition", null),
  ],
  // 1 TRANSITION_DETECTED
  [
    item("airway", "not_evaluated", "—", "Plan building…", null),
    item("infusions", "not_evaluated", "—", "Plan building…", null),
    item("transport", "not_evaluated", "—", "Plan building…", null),
    item("cardiac_device", "not_evaluated", "—", "Plan building…", null),
    item("monitoring", "not_evaluated", "—", "Plan building…", null),
    item("destination", "not_evaluated", "—", "Plan building…", null),
  ],
  // 2 CONTEXT_ANALYZED
  [
    item("airway", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("infusions", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("transport", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("cardiac_device", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("monitoring", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("destination", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
  ],
  // 3 BLOCKER_IDENTIFIED
  [
    item("airway", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("infusions", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("transport", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("cardiac_device", "pending_verification", "Routed to Cardiac Device / EP", "Verification requested", "09:13"),
    item("monitoring", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("destination", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
  ],
  // 4 BEDSIDE_UPDATE_CAPTURED
  [
    item("airway", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("infusions", "complete", "Bedside RN reported", "Infusion + medication supply confirmed", "09:16"),
    item("transport", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("cardiac_device", "pending_verification", "Routed to Cardiac Device / EP", "Verification requested", "09:13"),
    item("monitoring", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
    item("destination", "in_progress", "EHR verified", "Readiness plan generated", "09:12"),
  ],
  // 5 DEVICE_RESPONSE_RECEIVED
  [
    item("airway", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("infusions", "complete", "Bedside RN reported", "Infusion + medication supply confirmed", "09:16"),
    item("transport", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("cardiac_device", "complete", "Device service verified", "MRI pathway verified · pre-scan programming completed", "09:20"),
    item("monitoring", "complete", "EHR verified", "Transport monitoring plan confirmed", "09:20"),
    item("destination", "complete", "EHR verified", "MRI suite bay confirmed, staff notified", "09:20"),
  ],
  // 6 ALL_REQUIREMENTS_COMPLETE
  [
    item("airway", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("infusions", "complete", "Bedside RN reported", "Infusion + medication supply confirmed", "09:16"),
    item("transport", "complete", "RT acknowledged", "Transport ventilator ready", "09:16"),
    item("cardiac_device", "complete", "Device service verified", "MRI pathway verified · pre-scan programming completed", "09:20"),
    item("monitoring", "complete", "EHR verified", "Transport monitoring plan confirmed", "09:20"),
    item("destination", "complete", "EHR verified", "MRI suite bay confirmed, staff notified", "09:20"),
  ],
];

const ALL_EVENTS: { atPhase: number; event: ActivityEvent }[] = [
  { atPhase: 1, event: { time: "09:12", text: "Urgent MRI transition detected" } },
  { atPhase: 2, event: { time: "09:12", text: "Patient-specific readiness plan generated" } },
  { atPhase: 3, event: { time: "09:13", text: "Device verification routed to Cardiac Device / EP" } },
  { atPhase: 4, event: { time: "09:16", text: "Bedside coordination captured" } },
  { atPhase: 4, event: { time: "09:16", text: "RT transport ventilator acknowledged" } },
  { atPhase: 5, event: { time: "09:20", text: "Device pathway verified" } },
  { atPhase: 6, event: { time: "09:21", text: "All tracked requirements complete" } },
];

function activityForPhase(phaseIndex: number): ActivityEvent[] {
  const events = ALL_EVENTS.filter((e) => e.atPhase <= phaseIndex).map((e) => e.event);
  return events.slice(-4);
}

const CONTEXT_FACTS = [
  { label: "Post-Glenn single-ventricle physiology", provenance: "EHR verified" },
  { label: "Mechanically ventilated", provenance: "EHR verified" },
  { label: "Weight: 7.2 kg", provenance: "EHR verified" },
  { label: "Continuous vasoactive + dexmedetomidine infusions", provenance: "EHR verified" },
  { label: "Chest tubes, arterial line, central venous line", provenance: "EHR verified" },
  { label: "Permanent epicardial pacemaker documented", provenance: "EHR verified" },
];

export function getPhaseSnapshot(phaseIndex: number): PhaseSnapshot {
  const index = Math.max(0, Math.min(phaseIndex, PHASE_IDS.length - 1));
  const id = PHASE_IDS[index];
  const readiness = READINESS_BY_PHASE[index];
  const activity = activityForPhase(index);

  const base: Omit<PhaseSnapshot, "primaryStatus" | "detailSlot"> = {
    id,
    index,
    durationSec: PHASE_DURATIONS_SEC[index],
    showMriTag: index >= 1,
    readiness,
    activity,
    transportWindow: index === 6 ? "10:30" : undefined,
  };

  switch (id) {
    case "PATIENT_BASELINE":
      return {
        ...base,
        primaryStatus: {
          tone: "neutral",
          title: "No active transition",
          subtitle: "PICU · continuous monitoring",
        },
        detailSlot: { kind: "none" },
      };
    case "TRANSITION_DETECTED":
      return {
        ...base,
        primaryStatus: {
          tone: "amber",
          eyebrow: "URGENT TRANSITION DETECTED",
          title: "PICU → Brain MRI",
          meta: "Building patient-specific readiness plan…",
        },
        detailSlot: { kind: "rounds_quote" },
      };
    case "CONTEXT_ANALYZED":
      return {
        ...base,
        primaryStatus: {
          tone: "amber",
          eyebrow: "URGENT TRANSITION DETECTED",
          title: "PICU → Brain MRI",
          meta: "Structuring patient-specific context…",
        },
        detailSlot: { kind: "context_facts", facts: CONTEXT_FACTS },
      };
    case "BLOCKER_IDENTIFIED":
      return {
        ...base,
        primaryStatus: {
          tone: "amber",
          eyebrow: "URGENT TRANSITION DETECTED",
          title: "PICU → Brain MRI",
          meta: "1 of 6 categories awaiting verification",
        },
        detailSlot: { kind: "blocker" },
      };
    case "BEDSIDE_UPDATE_CAPTURED":
      return {
        ...base,
        primaryStatus: {
          tone: "amber",
          eyebrow: "URGENT TRANSITION DETECTED",
          title: "PICU → Brain MRI",
          meta: "Bedside update received — updating readiness",
        },
        detailSlot: { kind: "bedside_update" },
      };
    case "DEVICE_RESPONSE_RECEIVED":
      return {
        ...base,
        primaryStatus: {
          tone: "amber",
          eyebrow: "URGENT TRANSITION DETECTED",
          title: "PICU → Brain MRI",
          meta: "Cardiac device pathway verified",
        },
        detailSlot: { kind: "device_response" },
      };
    case "ALL_REQUIREMENTS_COMPLETE":
      return {
        ...base,
        primaryStatus: {
          tone: "green",
          title: "ALL TRACKED REQUIREMENTS COMPLETE",
          subtitle: "MRI transport window: 10:30",
        },
        detailSlot: { kind: "none" },
      };
    default:
      return {
        ...base,
        primaryStatus: { tone: "neutral", title: "No active transition" },
        detailSlot: { kind: "none" },
      };
  }
}

export const TOTAL_PHASES = PHASE_IDS.length;

export const TOTAL_DEMO_SEC = PHASE_DURATIONS_SEC.reduce((a, b) => a + b, 0);

/**
 * Guard used by the demo engine: the final ALL_REQUIREMENTS_COMPLETE phase
 * may only be entered once every readiness item is actually complete.
 */
export function canEnterPhase(index: number): boolean {
  if (index < TOTAL_PHASES - 1) return true;
  return READINESS_BY_PHASE[TOTAL_PHASES - 1].every((r) => r.status === "complete");
}
