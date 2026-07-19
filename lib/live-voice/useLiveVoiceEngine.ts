"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractFromTranscript } from "./extraction";
import { deriveCardStatus, initialLiveCategories } from "./patientContext";
import {
  createSpeechEngine,
  isSpeechRecognitionSupported,
  type SpeechEngineHandle,
} from "./speechRecognition";
import type {
  AppliedUpdate,
  GuardedStatement,
  ListeningState,
  LiveCategoryState,
  TranscriptEntry,
  VerificationRequest,
} from "./types";

/**
 * Delays before simulated services "respond" to routed verification
 * requests. Tuned so responses routed mid-demo land on screen a couple of
 * beats later without presenter involvement.
 */
export const CARDIOLOGY_RESPONSE_DELAY_MS = 28_000;
export const RT_RESPONSE_DELAY_MS = 18_000;

/**
 * Declarative routing table: which applied update routes a request to which
 * (simulated) service, what the response confirms, and which spoken update
 * supersedes a pending response. All deterministic and local.
 */
interface RoutingRule {
  id: string;
  target: string;
  categoryId: import("@/lib/transition-readiness/types").ReadinessCategoryId;
  delayMs: number;
  trigger: (u: AppliedUpdate) => boolean;
  supersededBy: (u: AppliedUpdate) => boolean;
  respondSubreqIds: string[];
  responseEvidence: string;
  responseNote: string;
}

const ROUTING_RULES: RoutingRule[] = [
  {
    id: "cardiology",
    target: "Cardiology / EP service",
    categoryId: "cardiac_device",
    delayMs: CARDIOLOGY_RESPONSE_DELAY_MS,
    trigger: (u) => u.categoryId === "cardiac_device" && u.newState === "blocked",
    supersededBy: (u) => u.subreqId === "mri_conditional" && u.newState === "confirmed",
    respondSubreqIds: ["mri_conditional", "device_plan"],
    responseEvidence:
      "Cardiology / EP response — MRI-conditional verified, pre-scan programming complete",
    responseNote: "MRI-conditional status verified · pre-scan programming completed",
  },
  {
    id: "rt-transport",
    target: "Respiratory Therapy service",
    categoryId: "transport",
    delayMs: RT_RESPONSE_DELAY_MS,
    trigger: (u) => u.subreqId === "rt_required" && u.newState === "confirmed",
    supersededBy: (u) => u.subreqId === "rt_accepted" && u.newState === "confirmed",
    respondSubreqIds: ["rt_accepted"],
    responseEvidence: "RT service response — transport accepted, crew assigned",
    responseNote: "RT transport accepted · transport crew assigned",
  },
];

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
function countWord(n: number): string {
  const w = NUMBER_WORDS[n] ?? String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function buildSystemMessage(appliedCount: number, categories: LiveCategoryState[]): string {
  const blockedCards = categories
    .filter((c) => {
      const d = deriveCardStatus(c);
      return d === "blocked" || d === "contradictory";
    })
    .map((c) => c.label);
  const pendingCount = categories
    .flatMap((c) => c.subreqs)
    .filter((s) => s.state === "pending").length;

  if (appliedCount === 0) {
    return "No checklist items matched — captured in transcript only.";
  }
  let msg = `${countWord(appliedCount)} readiness item${appliedCount === 1 ? "" : "s"} updated.`;
  if (blockedCards.length > 0) {
    msg += ` ${blockedCards.join(" and ")} verification remains outstanding.`;
  } else if (pendingCount > 0) {
    msg += ` ${pendingCount} requirement${pendingCount === 1 ? "" : "s"} still awaiting confirmation.`;
  } else {
    msg += " All tracked requirements confirmed.";
  }
  return msg;
}

export interface LiveVoiceEngine {
  listeningState: ListeningState;
  errorMessage: string | null;
  supported: boolean;
  interimText: string;
  transcript: TranscriptEntry[];
  updates: AppliedUpdate[];
  guardedStatements: GuardedStatement[];
  categories: LiveCategoryState[];
  systemMessage: string | null;
  verificationRequests: VerificationRequest[];
  startListening: () => void;
  pauseListening: () => void;
  stopListening: () => void;
  submitManualTranscript: (text: string) => void;
}

export function useLiveVoiceEngine(): LiveVoiceEngine {
  const [listeningState, setListeningState] = useState<ListeningState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [updates, setUpdates] = useState<AppliedUpdate[]>([]);
  const [guardedStatements, setGuardedStatements] = useState<GuardedStatement[]>([]);
  const [categories, setCategories] = useState<LiveCategoryState[]>(initialLiveCategories);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);

  const engineRef = useRef<SpeechEngineHandle | null>(null);
  const categoriesRef = useRef<LiveCategoryState[]>(categories);
  const verificationTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const verificationRequestsRef = useRef<VerificationRequest[]>([]);
  // iOS Safari frequently never flags results as final — it just ends the
  // session after a silence. Track the latest interim text so it can be
  // flushed through the pipeline on end, and whether the user still wants
  // to be listening so the session can be restarted transparently.
  const pendingInterimRef = useRef("");
  const wantListeningRef = useRef(false);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  /**
   * Simulated async response from a routed service. Confirms the rule's
   * target subrequirements with `service` provenance. Deterministic and
   * local — no real integration.
   */
  const applyServiceResponse = useCallback((ruleId: string) => {
    const rule = ROUTING_RULES.find((r) => r.id === ruleId);
    const req = verificationRequestsRef.current.find((r) => r.id === ruleId);
    if (!rule || !req || req.status === "responded") return;
    const time = nowTime();
    const applied: AppliedUpdate[] = [];
    const next = categoriesRef.current.map((cat) => {
      if (cat.id !== rule.categoryId) return cat;
      return {
        ...cat,
        subreqs: cat.subreqs.map((s) => {
          if (!rule.respondSubreqIds.includes(s.id)) return s;
          if (s.state === "confirmed") return s;
          applied.push({
            id: nextId("u"),
            categoryId: cat.id,
            categoryLabel: cat.label,
            subreqId: s.id,
            subreqLabel: s.label,
            newState: "confirmed",
            clause: rule.responseEvidence,
            source: "service",
            timestamp: time,
            confidence: 99,
          });
          return {
            ...s,
            state: "confirmed" as const,
            provenance: "service" as const,
            updatedAt: time,
            evidenceClause: rule.responseEvidence,
          };
        }),
      };
    });
    categoriesRef.current = next;
    setCategories(next);
    if (applied.length > 0) setUpdates((prev) => [...prev, ...applied]);
    const respondedReq: VerificationRequest = {
      ...req,
      status: "responded",
      respondedAt: time,
      responseNote: rule.responseNote,
    };
    verificationRequestsRef.current = verificationRequestsRef.current.map((r) =>
      r.id === ruleId ? respondedReq : r,
    );
    setVerificationRequests(verificationRequestsRef.current);
    setSystemMessage(`${rule.target} responded. ${buildSystemMessage(applied.length, next)}`);
  }, []);

  /**
   * The single pipeline for voice and typed input. Extracts facts from the
   * finalized segment, matches them to existing checklist subrequirements,
   * and applies the resulting states immediately. All status decisions are
   * deterministic checklist rules — extraction only identifies facts.
   */
  const processTranscript = useCallback((text: string, source: "voice" | "manual") => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = nowTime();
    setTranscript((prev) => [...prev, { id: nextId("t"), text: trimmed, timestamp: time, source }]);

    const { candidates, guards } = extractFromTranscript(trimmed);

    if (guards.length > 0) {
      setGuardedStatements((prev) => [
        ...prev,
        ...guards.map((g) => ({
          id: nextId("g"),
          heardText: g.heardText,
          timestamp: time,
          message: g.message,
        })),
      ]);
    }

    if (candidates.length === 0) {
      if (guards.length === 0) {
        setSystemMessage(buildSystemMessage(0, categoriesRef.current));
      }
      return;
    }

    const applied: AppliedUpdate[] = [];
    const next = categoriesRef.current.map((cat) => {
      const hits = candidates.filter((c) => c.categoryId === cat.id);
      if (hits.length === 0) return cat;
      return {
        ...cat,
        subreqs: cat.subreqs.map((s) => {
          const hit = hits.find((h) => h.subreqId === s.id);
          if (!hit) return s;
          applied.push({
            id: nextId("u"),
            categoryId: cat.id,
            categoryLabel: cat.label,
            subreqId: s.id,
            subreqLabel: s.label,
            newState: hit.effect,
            clause: hit.clause,
            source,
            timestamp: time,
            confidence: hit.confidence,
          });
          return {
            ...s,
            state: hit.effect,
            provenance: source,
            updatedAt: time,
            evidenceClause: hit.clause,
          };
        }),
      };
    });

    categoriesRef.current = next;
    setCategories(next);
    setUpdates((prev) => [...prev, ...applied]);
    setSystemMessage(buildSystemMessage(applied.length, next));

    // Agentic routing: certain applied updates route a verification request
    // to a (simulated) service, which responds asynchronously.
    for (const rule of ROUTING_RULES) {
      const alreadyRouted = verificationRequestsRef.current.some((r) => r.id === rule.id);
      if (!alreadyRouted && applied.some(rule.trigger)) {
        const req: VerificationRequest = {
          id: rule.id,
          target: rule.target,
          categoryId: rule.categoryId,
          status: "routed",
          routedAt: time,
          respondedAt: null,
          responseNote: null,
        };
        verificationRequestsRef.current = [...verificationRequestsRef.current, req];
        setVerificationRequests(verificationRequestsRef.current);
        verificationTimersRef.current.set(
          rule.id,
          setTimeout(() => applyServiceResponse(rule.id), rule.delayMs),
        );
      }
    }

    // A spoken confirmation supersedes a pending service response.
    for (const rule of ROUTING_RULES) {
      const req = verificationRequestsRef.current.find((r) => r.id === rule.id);
      if (req?.status === "routed" && applied.some(rule.supersededBy)) {
        const timer = verificationTimersRef.current.get(rule.id);
        if (timer) clearTimeout(timer);
        const superseded: VerificationRequest = {
          ...req,
          status: "responded",
          respondedAt: time,
          responseNote: "Confirmed verbally at bedside",
        };
        verificationRequestsRef.current = verificationRequestsRef.current.map((r) =>
          r.id === rule.id ? superseded : r,
        );
        setVerificationRequests(verificationRequestsRef.current);
      }
    }
  }, [applyServiceResponse]);

  const ensureEngine = useCallback(() => {
    if (engineRef.current) return engineRef.current;
    const handle = createSpeechEngine({
      onResult: ({ text, isFinal }) => {
        if (isFinal) {
          pendingInterimRef.current = "";
          setInterimText("");
          processTranscript(text, "voice");
        } else {
          pendingInterimRef.current = text;
          setInterimText(text);
        }
      },
      onError: (code) => {
        if (code === "no-speech" || code === "aborted") return;
        const messages: Record<string, string> = {
          "not-allowed": "Microphone permission was denied. Use the transcript field below instead.",
          "service-not-allowed":
            "Speech recognition isn't available in this context. Use the transcript field below instead.",
          network: "Speech recognition needs a secure (HTTPS) connection. Use the transcript field below instead.",
        };
        setErrorMessage(
          messages[code] ?? "Speech recognition stopped unexpectedly. Use the transcript field below instead.",
        );
        setListeningState("error");
      },
      onEnd: () => {
        // Flush any speech iOS never marked final so it still becomes an update.
        const leftover = pendingInterimRef.current.trim();
        pendingInterimRef.current = "";
        if (leftover) {
          setInterimText("");
          processTranscript(leftover, "voice");
        }
        // iOS ends the session after each silence — restart transparently
        // while the user still wants to be listening.
        if (wantListeningRef.current && engineRef.current) {
          try {
            engineRef.current.start();
            return;
          } catch {
            // fall through to stopped
          }
        }
        setListeningState((current) => (current === "listening" ? "stopped" : current));
      },
    });
    engineRef.current = handle;
    return handle;
  }, [processTranscript]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    if (!isSpeechRecognitionSupported()) {
      setListeningState("unsupported");
      return;
    }
    setListeningState("requesting");
    const engine = ensureEngine();
    if (!engine) {
      setListeningState("unsupported");
      return;
    }
    wantListeningRef.current = true;
    try {
      engine.start();
      setListeningState("listening");
    } catch {
      setListeningState("listening");
    }
  }, [ensureEngine]);

  const pauseListening = useCallback(() => {
    wantListeningRef.current = false;
    engineRef.current?.stop();
    setListeningState("paused");
  }, []);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    engineRef.current?.stop();
    setInterimText("");
    setListeningState("stopped");
  }, []);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      engineRef.current?.abort();
      verificationTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const submitManualTranscript = useCallback(
    (text: string) => {
      processTranscript(text, "manual");
    },
    [processTranscript],
  );

  return {
    listeningState,
    errorMessage,
    supported,
    interimText,
    transcript,
    updates,
    guardedStatements,
    categories,
    systemMessage,
    verificationRequests,
    startListening,
    pauseListening,
    stopListening,
    submitManualTranscript,
  };
}
