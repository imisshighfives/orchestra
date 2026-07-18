import type {
  CardDerivedStatus,
  LiveCategoryState,
  Subrequirement,
  SubreqState,
} from "./types";

/**
 * Preloaded patient-specific checklist for the synthetic Mateo Patel case.
 * Live Voice does not create this checklist — it confirms or resolves the
 * requirements below. All content is synthetic.
 */

function item(id: string, label: string, state: SubreqState = "pending"): Subrequirement {
  return { id, label, state, provenance: "chart", updatedAt: null, evidenceClause: null };
}

export function initialLiveCategories(): LiveCategoryState[] {
  return [
    {
      id: "airway",
      label: "Airway",
      idleLabel: "Verification needed",
      subreqs: [
        item("transport_ventilator", "Transport ventilator ready"),
        item("oxygen_tank", "Oxygen tank full"),
        item("portable_suction", "Portable suction ready"),
      ],
    },
    {
      id: "infusions",
      label: "Infusions",
      idleLabel: "Verification needed",
      subreqs: [
        item("peripheral_ivs", "Bilateral PIVs working"),
        item("arterial_line", "Arterial line present"),
        item("picc_line", "PICC present"),
        item("drips_secured", "Continuous drips secured and accounted for"),
      ],
    },
    {
      id: "transport",
      label: "Transport",
      idleLabel: "Pending",
      subreqs: [
        item("rt_required", "RT transport required", "known"),
        item("rt_accepted", "RT transport accepted"),
        item("pickup_timing", "Pickup timing coordinated"),
      ],
    },
    {
      id: "cardiac_device",
      label: "Cardiac Device",
      idleLabel: "Verification needed",
      subreqs: [
        item("pacemaker_present", "Pacemaker present", "known"),
        item("mri_conditional", "MRI-conditional status confirmed by cardiology", "blocked"),
        item("device_plan", "Device management plan documented"),
      ],
    },
    {
      id: "monitoring",
      label: "Monitoring",
      idleLabel: "Verification needed",
      subreqs: [
        item("continuous_monitoring", "Continuous monitoring available"),
        item("arterial_monitoring", "Arterial-line monitoring plan confirmed"),
        item("morning_labs", "Morning labs reviewed"),
      ],
    },
    {
      id: "destination",
      label: "Destination",
      idleLabel: "Pending",
      subreqs: [
        item("mri_consent", "MRI consent signed"),
        item("npo_timing", "NPO timing acceptable"),
        item("interpreter", "Spanish interpreter available"),
        item("anesthesia_assessment", "Anesthesia pre-procedure assessment complete"),
        item("mri_team", "MRI team ready to receive patient"),
      ],
    },
  ];
}

/**
 * Deterministic card derivation. The model never sets these — only checklist
 * rules do. A single confirmed fact never makes a card Ready on its own.
 *
 * - contradictory if any item contradicts known/expected state (red)
 * - blocked if any item is blocked (red)
 * - ready only when every required item is satisfied (green)
 * - in_progress when some, but not all, are satisfied (amber)
 * - idle when nothing has been resolved yet (amber)
 */
export function deriveCardStatus(cat: LiveCategoryState): CardDerivedStatus {
  const items = cat.subreqs;
  if (items.some((s) => s.state === "contradictory")) return "contradictory";
  if (items.some((s) => s.state === "blocked")) return "blocked";

  const required = items.filter((s) => s.state !== "not_applicable");
  const satisfied = (s: Subrequirement) => s.state === "confirmed" || s.state === "known";
  if (required.length > 0 && required.every(satisfied)) return "ready";
  if (items.some((s) => s.state === "confirmed")) return "in_progress";
  return "idle";
}
