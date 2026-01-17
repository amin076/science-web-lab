// src/simulations/subjects/physics/mechanics/gyroscope/useLoop.js

import { useCallback, useEffect, useRef } from "react";

/**
 * useSimLoop (flat template)
 * - RAF loop
 * - dt clamp (maxDt)
 * - supports variable dt OR fixed timestep (better physics stability)
 * - uses refs so loop DOES NOT restart on each React render
 * - resets clock on blur/visibilitychange to avoid dt jumps
 *
 * useSimLoop({
 *   running,
 *   mode: "variable" | "fixed",
 *   maxDt,
 *   fixedDt,
 *   maxSubSteps,
 *   step(dt),
 *   draw(),
 *   onFrame(out, dt, didStep),
 *   uiHz,              // throttle onFrame calls (0 = every frame)
 *   pauseWhenHidden,   // default true
 * })
 */
export function useSimLoop({
  running,
  mode = "variable",
  maxDt = 1 / 30,
  fixedDt = 1 / 120,
  maxSubSteps = 5,
  step,
  draw,
  onFrame,
  uiHz = 0,
  pauseWhenHidden = true,
}) {
  const rafRef = useRef(0);

  // Stable refs (prevent loop restart)
  const runningRef = useRef(!!running);
  const stepRef = useRef(step);
  const drawRef = useRef(draw);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    runningRef.current = !!running;
  }, [running]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  // Timing refs
  const lastTRef = useRef(null); // last RAF timestamp (ms)
  const accRef = useRef(0); // accumulator for fixed timestep
  const uiAccRef = useRef(0); // throttle accumulator

  const resetClock = useCallback(() => {
    lastTRef.current = null;
    accRef.current = 0;
    uiAccRef.current = 0;
  }, []);

  // Reset clock on blur/visibility change to avoid dt spikes
  useEffect(() => {
    const handle = () => resetClock();
    window.addEventListener("blur", handle);
    document.addEventListener("visibilitychange", handle);
    return () => {
      window.removeEventListener("blur", handle);
      document.removeEventListener("visibilitychange", handle);
    };
  }, [resetClock]);

  useEffect(() => {
    const loop = (tMs) => {
      // If tab hidden, keep clock clean
      if (pauseWhenHidden && document.hidden) {
        resetClock();
        drawRef.current?.();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (lastTRef.current == null) lastTRef.current = tMs;

      let dt = (tMs - lastTRef.current) / 1000;
      lastTRef.current = tMs;

      if (dt < 0) dt = 0;
      if (dt > maxDt) dt = maxDt;

      let out = null;
      let didStep = false;

      if (runningRef.current && dt > 0) {
        if (mode === "fixed") {
          accRef.current += dt;

          let steps = 0;
          while (accRef.current >= fixedDt && steps < maxSubSteps) {
            didStep = true;
            out = stepRef.current?.(fixedDt) ?? out;
            accRef.current -= fixedDt;
            steps++;
          }

          // If too many substeps, drop remainder to prevent runaway
          if (steps >= maxSubSteps) accRef.current = 0;
        } else {
          didStep = true;
          out = stepRef.current?.(dt);
        }
      } else {
        // If paused, clear accumulator so resume doesn't "burst"
        accRef.current = 0;
      }

      // Draw every frame
      drawRef.current?.();

      // Throttle onFrame (charts/UI updates)
      const cb = onFrameRef.current;
      if (cb) {
        if (uiHz && uiHz > 0) {
          uiAccRef.current += dt;
          const every = 1 / uiHz;
          if (uiAccRef.current >= every) {
            cb(out, dt, didStep);
            uiAccRef.current = 0;
          }
        } else {
          cb(out, dt, didStep);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fixedDt, maxDt, maxSubSteps, mode, pauseWhenHidden, resetClock, uiHz]);

  return { resetClock };
}
