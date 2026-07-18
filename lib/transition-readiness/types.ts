export type ReadinessStatus =
  | "not_evaluated"
  | "in_progress"
  | "pending_verification"
  | "complete";

export type ReadinessCategoryId =
  | "airway"
  | "infusions"
  | "transport"
  | "cardiac_device"
  | "monitoring"
  | "destination";

export interface ReadinessItem {
  id: ReadinessCategoryId;
  label: string;
  status: ReadinessStatus;
  source: string;
  owner: string;
  evidenceLabel: string;
  updatedAt: string | null;
}

export type StatusTone = "neutral" | "amber" | "green";

export interface PrimaryStatus {
  tone: StatusTone;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

export type DetailSlotKind =
  | "none"
  | "rounds_quote"
  | "context_facts"
  | "blocker"
  | "bedside_update"
  | "device_response";

export interface ContextFact {
  label: string;
  provenance: string;
}

export interface DetailSlot {
  kind: DetailSlotKind;
  facts?: ContextFact[];
}

export interface ActivityEvent {
  time: string;
  text: string;
}

export type PhaseId =
  | "PATIENT_BASELINE"
  | "TRANSITION_DETECTED"
  | "CONTEXT_ANALYZED"
  | "BLOCKER_IDENTIFIED"
  | "BEDSIDE_UPDATE_CAPTURED"
  | "DEVICE_RESPONSE_RECEIVED"
  | "ALL_REQUIREMENTS_COMPLETE";

export interface PhaseSnapshot {
  id: PhaseId;
  index: number;
  durationSec: number;
  showMriTag: boolean;
  primaryStatus: PrimaryStatus;
  detailSlot: DetailSlot;
  readiness: ReadinessItem[];
  activity: ActivityEvent[];
  transportWindow?: string;
}
