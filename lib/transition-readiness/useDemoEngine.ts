"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHASE_START_SEC, TOTAL_PHASES, canEnterPhase } from "./timeline";

export interface DemoEngine {
  phaseIndex: number;
  running: boolean;
  started: boolean;
  finished: boolean;
  prefersReducedMotion: boolean;
  isDemoQueryMode: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  next: () => void;
  prev: () => void;
}

const TICK_MS = 100;

/** Resolve which phase should be showing for a given elapsed time. Pure + idempotent. */
function phaseForElapsedSec(elapsedSec: number): number {
  let index = 0;
  for (let i = 0; i < TOTAL_PHASES; i++) {
    if (elapsedSec >= PHASE_START_SEC[i]) index = i;
  }
  if (!canEnterPhase(index)) return Math.max(0, TOTAL_PHASES - 2);
  return index;
}

export function useDemoEngine(): DemoEngine {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDemoQueryMode, setIsDemoQueryMode] = useState(false);

  // Wall-clock model: total elapsed ms = baseElapsedMs + (now - segmentStartedAt) while running.
  // Deriving phase from absolute elapsed time (rather than chaining relative timeouts) keeps the
  // engine idempotent under React Strict Mode's double-invoked effects/updaters.
  const baseElapsedMsRef = useRef(0);
  const segmentStartedAtRef = useRef(0);
  const phaseIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    phaseIndexRef.current = phaseIndex;
  }, [phaseIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setIsDemoQueryMode(params.get("demo") === "1");

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsedSec = (baseElapsedMsRef.current + (Date.now() - segmentStartedAtRef.current)) / 1000;
    const nextPhase = phaseForElapsedSec(elapsedSec);
    if (nextPhase !== phaseIndexRef.current) {
      phaseIndexRef.current = nextPhase;
      setPhaseIndex(nextPhase);
    }
    if (nextPhase >= TOTAL_PHASES - 1) {
      setRunning(false);
    }
  }, []);

  // Autoplay ticker
  useEffect(() => {
    clearTimer();
    if (!running) return;
    intervalRef.current = setInterval(tick, TICK_MS);
    return clearTimer;
  }, [running, tick, clearTimer]);

  const start = useCallback(() => {
    baseElapsedMsRef.current = 0;
    segmentStartedAtRef.current = Date.now();
    phaseIndexRef.current = 0;
    setStarted(true);
    setPhaseIndex(0);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!running) return;
    baseElapsedMsRef.current += Date.now() - segmentStartedAtRef.current;
    setRunning(false);
  }, [running]);

  const resume = useCallback(() => {
    if (!started || phaseIndexRef.current >= TOTAL_PHASES - 1) return;
    segmentStartedAtRef.current = Date.now();
    setRunning(true);
  }, [started]);

  const reset = useCallback(() => {
    clearTimer();
    baseElapsedMsRef.current = 0;
    phaseIndexRef.current = 0;
    setRunning(false);
    setStarted(false);
    setPhaseIndex(0);
  }, [clearTimer]);

  const gotoManual = useCallback(
    (updater: (i: number) => number) => {
      clearTimer();
      const target = Math.max(0, Math.min(updater(phaseIndexRef.current), TOTAL_PHASES - 1));
      const index = canEnterPhase(target) ? target : phaseIndexRef.current;
      baseElapsedMsRef.current = PHASE_START_SEC[index] * 1000;
      segmentStartedAtRef.current = Date.now();
      phaseIndexRef.current = index;
      setRunning(false);
      setStarted(true);
      setPhaseIndex(index);
    },
    [clearTimer],
  );

  const next = useCallback(() => gotoManual((i) => i + 1), [gotoManual]);
  const prev = useCallback(() => gotoManual((i) => i - 1), [gotoManual]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!started) {
          start();
        } else if (running) {
          pause();
        } else {
          resume();
        }
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started, running, start, pause, resume, next, prev, reset]);

  return {
    phaseIndex,
    running,
    started,
    finished: started && phaseIndex >= TOTAL_PHASES - 1,
    prefersReducedMotion,
    isDemoQueryMode,
    start,
    pause,
    resume,
    reset,
    next,
    prev,
  };
}
