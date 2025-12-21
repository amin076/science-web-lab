import { useCallback, useEffect, useRef } from "react";

/**
 * useRafLoop(onFrame, options)
 * - Safe requestAnimationFrame loop with cleanup
 * - Provides dt (seconds) with clamping
 *
 * Usage:
 * const { start, stop, isRunningRef } = useRafLoop((dt, t) => {...});
 */
export function useRafLoop(onFrame, options = {}) {
  const { maxDt = 0.05 } = options;

  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(null);
  const isRunningRef = useRef(false);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const tick = useCallback(
    (time) => {
      if (!isRunningRef.current) return;

      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, maxDt);
      lastTimeRef.current = time;

      try {
        onFrameRef.current(dt, time);
      } catch (e) {
        // Let ErrorBoundary catch by rethrowing in next microtask
        // (prevents silent infinite loop)
        isRunningRef.current = false;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        lastTimeRef.current = null;

        Promise.resolve().then(() => {
          throw e;
        });
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    },
    [maxDt]
  );

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = null;
    lastTimeRef.current = null;
  }, []);

  // ✅ Cleanup on unmount
  useEffect(() => stop, [stop]);

  return { start, stop, isRunningRef };
}
