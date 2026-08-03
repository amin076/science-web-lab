import { useCallback, useEffect, useState } from "react";

const DEFAULT_ERRORS = {
  ar: "The AR session could not be started.",
  vr: "The VR session could not be started.",
};

export default function useXRSession({ store }) {
  const [enabled, setEnabled] = useState(false);
  const [intent, setIntent] = useState(null);
  const [support, setSupport] = useState({ ar: null, vr: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function detectSupport() {
      if (typeof navigator === "undefined" || !navigator.xr?.isSessionSupported) {
        if (!cancelled) setSupport({ ar: false, vr: false });
        return;
      }

      const [ar, vr] = await Promise.all([
        navigator.xr.isSessionSupported("immersive-ar").catch(() => false),
        navigator.xr.isSessionSupported("immersive-vr").catch(() => false),
      ]);

      if (!cancelled) setSupport({ ar, vr });
    }

    detectSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!store?.subscribe) return undefined;

    const unsubscribe = store.subscribe((state) => {
      if (!state.session) {
        setEnabled(false);
        setIntent(null);
        setBusy(false);
      }
    });

    return unsubscribe;
  }, [store]);

  const enter = useCallback(
    async (mode) => {
      const isAR = mode === "ar";
      const supported = isAR ? support.ar : support.vr;

      if (supported === false) {
        setError(
          isAR
            ? "AR is not supported by this browser or device."
            : "VR is not supported by this browser or headset.",
        );
        return false;
      }

      setBusy(true);
      setError("");
      setIntent(mode);
      setEnabled(true);

      try {
        const state = store.getState();
        if (!state.session) {
          if (isAR) await store.enterAR();
          else await store.enterVR();
        }
        return true;
      } catch (sessionError) {
        console.error(`Unable to enter ${mode.toUpperCase()}`, sessionError);
        setError(sessionError?.message || DEFAULT_ERRORS[mode]);
        setEnabled(false);
        setIntent(null);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [store, support.ar, support.vr],
  );

  const enterAR = useCallback(() => enter("ar"), [enter]);
  const enterVR = useCallback(() => enter("vr"), [enter]);
  const clearError = useCallback(() => setError(""), []);

  return {
    enabled,
    intent,
    support,
    busy,
    error,
    enterAR,
    enterVR,
    clearError,
  };
}
