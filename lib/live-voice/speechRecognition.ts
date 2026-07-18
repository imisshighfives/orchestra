/**
 * Thin wrapper around the browser's Web Speech API (SpeechRecognition /
 * webkitSpeechRecognition). No network calls, no external model — this is a
 * local browser capability that may simply be unavailable, in which case
 * callers should fall back to manual transcript entry.
 */

export interface SpeechResultEvent {
  text: string;
  isFinal: boolean;
}

export interface SpeechEngineHandle {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechEngineCallbacks {
  onResult: (event: SpeechResultEvent) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}

// Minimal shape of the API surface we rely on — the DOM lib type
// definitions for SpeechRecognition are not universally available.
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getConstructor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getConstructor() !== null;
}

export function createSpeechEngine(callbacks: SpeechEngineCallbacks): SpeechEngineHandle | null {
  const Ctor = getConstructor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? "";
      callbacks.onResult({ text, isFinal: result.isFinal });
    }
  };

  recognition.onerror = (event: any) => {
    callbacks.onError(event?.error ?? "unknown");
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}
