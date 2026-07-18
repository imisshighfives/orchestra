import type { ReadinessCategoryId } from "@/lib/transition-readiness/types";

/**
 * Deterministic, model-free extraction. Fixed regex rules map transcript
 * clauses onto existing checklist subrequirements. The rules only ever
 * propose an effect for a specific item — the checklist derivation in
 * patientContext.ts decides all card-level status.
 *
 * Clause-level: one sentence may contain both completed and pending items,
 * so sentences are split on commas / "and" / "but" before matching, which
 * also scopes negation ("suction is NOT ready") to its own clause.
 */

export interface UpdateCandidate {
  categoryId: ReadinessCategoryId;
  subreqId: string;
  effect: "confirmed" | "blocked" | "contradictory" | "not_applicable";
  clause: string;
  confidence: number;
}

export interface GuardMatch {
  heardText: string;
  message: string;
}

export const CLEARANCE_GUARD_MESSAGE =
  "Medical clearance statements require clinician judgment and are not recorded as operational readiness completion.";

/** Never convert clinical/medical clearance language into readiness state. */
const CLEARANCE_GUARD =
  /(clear(ed)?\s+for\s+(the\s+)?(mri|transport|imaging|scan))|(medically\s+clear(ed)?)|(clinically\s+clear(ed)?)|(cleared\s+medically)/i;

/** Negation context within a single clause flips a confirm into a contradiction. */
const NEGATION =
  /\b(not|isn'?t|aren'?t|wasn'?t|won'?t|no longer|missing|broken|empty|blown|infiltrated|unavailable|down|lost|leaking)\b/i;

interface ConfirmRule {
  categoryId: ReadinessCategoryId;
  subreqId: string;
  test: RegExp;
  confidence: number;
}

/** Rules that keep an item blocked (explicit "still outstanding" language). */
interface BlockRule extends ConfirmRule {}

const KEEP_BLOCKED_RULES: BlockRule[] = [
  {
    categoryId: "cardiac_device",
    subreqId: "mri_conditional",
    test: /(still needs? to confirm)|(not yet (confirmed|verified))|(hasn'?t (confirmed|verified))|(awaiting cardiology)|(waiting (on|for) cardiology)|(cardiology[^.]*still)/i,
    confidence: 90,
  },
];

const NOT_APPLICABLE_RULES: ConfirmRule[] = [
  {
    categoryId: "destination",
    subreqId: "interpreter",
    test: /(no interpreter (needed|required))|(interpreter (is )?not (needed|required))/i,
    confidence: 88,
  },
  {
    categoryId: "destination",
    subreqId: "anesthesia_assessment",
    test: /anesthesia (assessment |eval(uation)? )?(is )?not (needed|required)/i,
    confidence: 88,
  },
];

const CONFIRM_RULES: ConfirmRule[] = [
  // Airway
  {
    categoryId: "airway",
    subreqId: "transport_ventilator",
    test: /(transport )?vent(ilator)?[^,.]*(ready|all set|set up|set|good to go|good|standing by|at (the )?bedside|in the room|here)|rt has the (transport )?vent(ilator)?/i,
    confidence: 93,
  },
  {
    categoryId: "airway",
    subreqId: "oxygen_tank",
    test: /(oxygen|o2)('s| tank)?[^,.]*(full|ready|topped|fresh|swapped|good)/i,
    confidence: 91,
  },
  {
    categoryId: "airway",
    subreqId: "portable_suction",
    test: /suction[^,.]*(ready|good to go|good|working|set up|set|hooked up|at (the )?bedside|here)/i,
    confidence: 91,
  },
  // Infusions
  {
    categoryId: "infusions",
    subreqId: "peripheral_ivs",
    test: /((two|both|bilateral)[^,.]*pivs?)|(pivs?[^,.]*(working|patent|good))|(peripheral ivs?[^,.]*(working|patent|good))/i,
    confidence: 90,
  },
  {
    categoryId: "infusions",
    subreqId: "arterial_line",
    test: /art(erial)?[- ]?line/i,
    confidence: 86,
  },
  {
    categoryId: "infusions",
    subreqId: "picc_line",
    test: /\bpicc\b/i,
    confidence: 86,
  },
  {
    categoryId: "infusions",
    subreqId: "drips_secured",
    test: /(drips?|infusions?|lines?)[^,.]*(secured|accounted|switched over|on the pump)|(secured|accounted)[^,.]*(drips?|infusions?)|mri[- ]compatible tubing|switched the drips|medication volume[^,.]*(adequate|sufficient|enough)/i,
    confidence: 88,
  },
  // Transport
  {
    categoryId: "transport",
    subreqId: "rt_accepted",
    test: /(rt|respiratory( therapy)?)[^,.]*(accepted|accepts|acknowledged|confirmed (the )?transport|will take|taking (the )?patient|on board|good to go|coming|on the way)/i,
    confidence: 90,
  },
  {
    categoryId: "transport",
    subreqId: "pickup_timing",
    test: /(pickup|pick[- ]up)[^,.]*(coordinated|confirmed|scheduled|set)|timing[^,.]*(coordinated|confirmed)/i,
    confidence: 88,
  },
  // Cardiac Device (past-tense confirmation required)
  {
    categoryId: "cardiac_device",
    subreqId: "mri_conditional",
    test: /(cardiology[^,.]*confirmed)|(confirmed[^,.]*mri[- ]?(conditional|compatible))|(mri[- ]?(conditional|compatible)[^,.]*confirmed)/i,
    confidence: 92,
  },
  {
    categoryId: "cardiac_device",
    subreqId: "device_plan",
    test: /(device (management )?plan[^,.]*(documented|in place|complete))|((pre[- ]?scan )?programming[^,.]*(complete|completed|done))/i,
    confidence: 90,
  },
  // Monitoring
  {
    categoryId: "monitoring",
    subreqId: "continuous_monitoring",
    test: /(transport )?monitor(ing|s)?[^,.]*(available|ready|set|on|good)/i,
    confidence: 87,
  },
  {
    categoryId: "monitoring",
    subreqId: "arterial_monitoring",
    test: /art(erial)?[- ]?line monitoring[^,.]*(confirmed|planned|set|ready)|transduc(ed|ing|er)/i,
    confidence: 86,
  },
  {
    categoryId: "monitoring",
    subreqId: "morning_labs",
    test: /(morning )?labs?[^,.]*(reviewed|back|checked|fine|unremarkable|okay|acceptable)/i,
    confidence: 88,
  },
  // Destination
  {
    categoryId: "destination",
    subreqId: "mri_consent",
    test: /consent(ed)?[^,.]*(signed|obtained|verified|done|complete|is in|on the chart)|signed[^,.]*consent/i,
    confidence: 92,
  },
  {
    categoryId: "destination",
    subreqId: "npo_timing",
    test: /\bnpo\b[^,.]*(acceptable|verified|confirmed|met|since)/i,
    confidence: 89,
  },
  {
    categoryId: "destination",
    subreqId: "interpreter",
    test: /interpreter[^,.]*(connected|available|ready|on the line|here|joined)/i,
    confidence: 92,
  },
  {
    categoryId: "destination",
    subreqId: "anesthesia_assessment",
    test: /anesthesia[^,.]*(assessment|eval(uation)?)[^,.]*(complete|completed|done)|anesthesia (saw|assessed|evaluated)/i,
    confidence: 89,
  },
  {
    categoryId: "destination",
    subreqId: "mri_team",
    test: /mri (team|suite)[^,.]*(ready|expecting|prepared|to receive|receiving)/i,
    confidence: 89,
  },
];

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitClauses(sentence: string): string[] {
  return sentence
    .split(/,|\band\b|\bbut\b/i)
    .map((c) => c.trim())
    .filter(Boolean);
}

export function extractFromTranscript(text: string): {
  candidates: UpdateCandidate[];
  guards: GuardMatch[];
} {
  const candidates: UpdateCandidate[] = [];
  const guards: GuardMatch[] = [];

  for (const sentence of splitSentences(text)) {
    if (CLEARANCE_GUARD.test(sentence)) {
      guards.push({ heardText: sentence, message: CLEARANCE_GUARD_MESSAGE });
      continue;
    }

    // One candidate per subrequirement per sentence.
    const claimed = new Set<string>();
    const key = (r: ConfirmRule) => `${r.categoryId}:${r.subreqId}`;

    for (const clause of splitClauses(sentence)) {
      for (const rule of KEEP_BLOCKED_RULES) {
        if (!claimed.has(key(rule)) && rule.test.test(clause)) {
          claimed.add(key(rule));
          candidates.push({
            categoryId: rule.categoryId,
            subreqId: rule.subreqId,
            effect: "blocked",
            clause,
            confidence: rule.confidence,
          });
        }
      }
      for (const rule of NOT_APPLICABLE_RULES) {
        if (!claimed.has(key(rule)) && rule.test.test(clause)) {
          claimed.add(key(rule));
          candidates.push({
            categoryId: rule.categoryId,
            subreqId: rule.subreqId,
            effect: "not_applicable",
            clause,
            confidence: rule.confidence,
          });
        }
      }
      const negated = NEGATION.test(clause);
      for (const rule of CONFIRM_RULES) {
        if (!claimed.has(key(rule)) && rule.test.test(clause)) {
          claimed.add(key(rule));
          candidates.push({
            categoryId: rule.categoryId,
            subreqId: rule.subreqId,
            effect: negated ? "contradictory" : "confirmed",
            clause,
            confidence: negated ? Math.max(70, rule.confidence - 10) : rule.confidence,
          });
        }
      }
    }
  }

  return { candidates, guards };
}
