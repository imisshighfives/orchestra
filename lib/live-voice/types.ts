import type { ReadinessCategoryId } from "@/lib/transition-readiness/types";

export type ListeningState =
  | "idle"
  | "requesting"
  | "listening"
  | "paused"
  | "stopped"
  | "error"
  | "unsupported";

/**
 * State of one checklist subrequirement.
 * - known: documented chart fact; informational, counts as satisfied
 * - pending: awaiting confirmation (amber)
 * - confirmed: resolved by live voice / manual transcript (green)
 * - blocked: cannot proceed until an external dependency resolves (red)
 * - contradictory: a report conflicts with the expected/known state (red)
 * - not_applicable: explicitly waived; excluded from derivation
 */
export type SubreqState =
  | "known"
  | "pending"
  | "confirmed"
  | "blocked"
  | "contradictory"
  | "not_applicable";

export type SubreqProvenance = "chart" | "voice" | "manual";

export interface Subrequirement {
  id: string;
  label: string;
  state: SubreqState;
  provenance: SubreqProvenance;
  updatedAt: string | null;
  /** Exact transcript clause that last changed this item, if any. */
  evidenceClause: string | null;
}

/** Card-level status is always derived from subrequirements, never set directly. */
export type CardDerivedStatus = "idle" | "in_progress" | "blocked" | "contradictory" | "ready";

export interface LiveCategoryState {
  id: ReadinessCategoryId;
  label: string;
  /** Label shown when nothing has been confirmed yet ("Verification needed" / "Pending"). */
  idleLabel: string;
  subreqs: Subrequirement[];
}

/** One immediate, deterministic checklist update produced from a transcript clause. */
export interface AppliedUpdate {
  id: string;
  categoryId: ReadinessCategoryId;
  categoryLabel: string;
  subreqId: string;
  subreqLabel: string;
  newState: SubreqState;
  /** Exact transcript segment used as provenance. */
  clause: string;
  source: "voice" | "manual";
  timestamp: string;
  confidence: number;
}

export interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: string;
  source: "voice" | "manual";
}

export interface GuardedStatement {
  id: string;
  heardText: string;
  timestamp: string;
  message: string;
}
