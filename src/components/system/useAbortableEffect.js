import { useEffect } from "react";

/**
 * useAbortableEffect(effect)
 * effect receives AbortSignal
 * Automatically aborts on unmount
 */
export function useAbortableEffect(effect, deps) {
  useEffect(() => {
    const controller = new AbortController();
    effect(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
