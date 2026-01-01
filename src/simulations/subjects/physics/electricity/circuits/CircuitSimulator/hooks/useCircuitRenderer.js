import { useEffect } from "react";
import { renderCircuit } from "../../CircuitUtils";

/**
 * Owns canvas sizing + calling renderCircuit().
 * Fixes blur by handling devicePixelRatio (HiDPI / Retina).
 */
export function useCircuitRenderer({ state, canvasRef, isTerminalConnected }) {
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;

    const resizeAndRender = () => {
      // اندازه CSS (نمایشی)
      const cssW = parent?.clientWidth ?? canvas.clientWidth ?? 800;
      const cssH = parent?.clientHeight ?? canvas.clientHeight ?? 500;

      const dpr = window.devicePixelRatio || 1;

      // اندازه واقعی پیکسلی (برای جلوگیری از blur)
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      // مختصات را بر حسب CSS-px نگه می‌داریم
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderCircuit(ctx, cssW, cssH, {
        components: state.components,
        connections: state.connections,
        selectedId: state.selectedId,
        hoveredTerminal: state.hoveredTerminal,
        simulationResults: state.results,
        connectingFrom: state.connectingFrom,
        mousePos: state.mousePos,
        animationOffset: state.animOffset,
        isTerminalConnected: isTerminalConnected,
      });
    };

    // یک بار رندر اولیه
    resizeAndRender();

    // اگر والد تغییر اندازه داد (Responsive) دوباره رندر کن
    let ro = null;
    if (parent && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resizeAndRender());
      ro.observe(parent);
    }

    // و همچنین تغییر اندازه پنجره
    window.addEventListener("resize", resizeAndRender);

    return () => {
      window.removeEventListener("resize", resizeAndRender);
      if (ro) ro.disconnect();
    };
  }, [
    state.components,
    state.connections,
    state.selectedId,
    state.hoveredTerminal,
    state.results,
    state.connectingFrom,
    state.mousePos,
    state.animOffset,
    canvasRef,
    isTerminalConnected,
  ]);
}
