"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Quote, Stethoscope } from "lucide-react";
import { bedsideQuote, roundsQuote } from "@/lib/transition-readiness/patient";
import type { DetailSlot as DetailSlotType } from "@/lib/transition-readiness/types";

function Provenance({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500">
      {children}
    </span>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">{children}</div>
  );
}

function RoundsQuoteCard() {
  return (
    <CardShell>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Quote className="h-3.5 w-3.5" aria-hidden />
        Rounds captured
      </div>
      <p className="mt-1.5 text-[14.5px] italic leading-snug text-slate-800">“{roundsQuote}”</p>
    </CardShell>
  );
}

function ContextFactsCard({ facts }: { facts: NonNullable<DetailSlotType["facts"]> }) {
  return (
    <CardShell>
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        Patient-specific context
      </div>
      <ul className="mt-1.5 space-y-1.5">
        {facts.map((fact, i) => (
          <motion.li
            key={fact.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.12 }}
            className="flex items-start justify-between gap-2 text-[13.5px] text-slate-800"
          >
            <span className="min-w-0 leading-snug">{fact.label}</span>
            <span className="shrink-0 pt-0.5">
              <Provenance>{fact.provenance}</Provenance>
            </span>
          </motion.li>
        ))}
      </ul>
    </CardShell>
  );
}

function BlockerCard() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
        Cardiac Device Pathway
      </p>
      <p className="mt-1 text-[15px] font-semibold text-amber-900">Permanent pacemaker documented</p>
      <p className="mt-0.5 text-[13px] leading-snug text-amber-800">
        MRI conditions and required device workflow not yet verified.
      </p>
      <div className="mt-2 flex items-start gap-1.5 border-t border-amber-200 pt-2">
        <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
        <p className="text-[12.5px] leading-snug text-amber-800">
          Device verification request routed to Cardiac Device / Electrophysiology service
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-amber-700">
        <Clock3 className="h-3.5 w-3.5" aria-hidden />
        Status: Awaiting response
      </div>
    </div>
  );
}

const BEDSIDE_ROWS = [
  { label: "Infusion setup", provenance: "Bedside RN reported" },
  { label: "Medication supply", provenance: "Bedside RN reported" },
  { label: "Transport ventilation", provenance: "RT acknowledged" },
];

function BedsideUpdateCard() {
  return (
    <CardShell>
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        Bedside coordination captured
      </div>
      <p className="mt-1.5 text-[14.5px] italic leading-snug text-slate-800">“{bedsideQuote}”</p>
      <ul className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
        {BEDSIDE_ROWS.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2 text-[13.5px]">
            <span className="text-slate-800">{row.label}</span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-emerald-700">Complete</span>
              <Provenance>{row.provenance}</Provenance>
            </span>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function DeviceResponseCard() {
  return (
    <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        Cardiac Device Response
      </p>
      <p className="mt-1 text-[15px] font-semibold text-emerald-900">MRI pathway verified</p>
      <p className="text-[14px] font-medium text-emerald-800">Pre-scan programming completed</p>
      <p className="mt-1.5 border-t border-emerald-200 pt-1.5 text-[12.5px] text-emerald-700">
        Source: Cardiac Device Service
      </p>
    </div>
  );
}

export function DetailSlot({
  slot,
  reducedMotion,
}: {
  slot: DetailSlotType;
  reducedMotion: boolean;
}) {
  if (slot.kind === "none") return <div className="mx-4 mt-3" aria-hidden />;

  const content =
    slot.kind === "rounds_quote" ? (
      <RoundsQuoteCard />
    ) : slot.kind === "context_facts" && slot.facts ? (
      <ContextFactsCard facts={slot.facts} />
    ) : slot.kind === "blocker" ? (
      <BlockerCard />
    ) : slot.kind === "bedside_update" ? (
      <BedsideUpdateCard />
    ) : slot.kind === "device_response" ? (
      <DeviceResponseCard />
    ) : null;

  if (reducedMotion) {
    return <div className="mx-4 mt-3">{content}</div>;
  }

  return (
    <div className="mx-4 mt-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={slot.kind}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
