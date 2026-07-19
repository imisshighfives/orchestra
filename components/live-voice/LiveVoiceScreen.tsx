"use client";

import { useLiveVoiceEngine } from "@/lib/live-voice/useLiveVoiceEngine";
import { CoordinationPanel } from "./CoordinationPanel";
import { GuardNotice } from "./GuardNotice";
import { LiveReadinessBoard } from "./LiveReadinessBoard";
import { MicControls } from "./MicControls";
import { SystemResponseBanner } from "./SystemResponseBanner";
import { TextFallbackInput } from "./TextFallbackInput";
import { TranscriptPanel } from "./TranscriptPanel";
import { UpdatesFeed } from "./UpdatesFeed";

export function LiveVoiceScreen() {
  const engine = useLiveVoiceEngine();

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <MicControls
        listeningState={engine.listeningState}
        errorMessage={engine.errorMessage}
        supported={engine.supported}
        onStart={engine.startListening}
        onPause={engine.pauseListening}
        onStop={engine.stopListening}
      />

      <TextFallbackInput
        emphasized={!engine.supported || engine.listeningState === "error"}
        onSubmit={engine.submitManualTranscript}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {engine.systemMessage ? <SystemResponseBanner message={engine.systemMessage} /> : null}

        {engine.verificationRequest ? (
          <CoordinationPanel request={engine.verificationRequest} />
        ) : null}

        <LiveReadinessBoard categories={engine.categories} />

        <UpdatesFeed updates={engine.updates} />

        {engine.guardedStatements.length > 0 ? (
          <section className="mx-4 mt-3 space-y-2">
            {[...engine.guardedStatements].reverse().map((g) => (
              <GuardNotice key={g.id} guard={g} />
            ))}
          </section>
        ) : null}

        <TranscriptPanel entries={engine.transcript} interimText={engine.interimText} />

        <p className="mx-4 mt-3 text-[9px] text-slate-300">
          Synthetic demo data · no real patient information · never a medical clearance
          determination ·{" "}
          <a
            href="https://github.com/imisshighfives/orchestra"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-200 underline-offset-2 hover:text-slate-400"
          >
            github.com/imisshighfives/orchestra
          </a>
        </p>
      </div>
    </div>
  );
}
