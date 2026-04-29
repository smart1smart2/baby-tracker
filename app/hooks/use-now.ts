import { useEffect, useState } from 'react';

/**
 * Singleton 1-second tick: every component that calls `useNow()` re-renders
 * on the same beat. Without sharing the timer, two `setInterval`s started at
 * different moments drift apart, so two duration labels reading the same
 * source can show different rounded values for a few hundred milliseconds.
 */

type Listener = (now: number) => void;

const listeners = new Set<Listener>();
let timerId: ReturnType<typeof setInterval> | null = null;

function ensureTimer() {
  if (timerId !== null) return;
  timerId = setInterval(() => {
    const now = Date.now();
    listeners.forEach((cb) => cb(now));
  }, 1000);
}

function maybeStopTimer() {
  if (listeners.size === 0 && timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

/** Returns the current epoch-ms; updates once per second. */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    listeners.add(setNow);
    ensureTimer();
    return () => {
      listeners.delete(setNow);
      maybeStopTimer();
    };
  }, []);
  return now;
}
