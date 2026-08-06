import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";

const qualityDprCaps = {
  low: 1,
  balanced: 2,
  high: 2.5,
  recording: 3,
};

function resolveDpr(quality, maxDevicePixelRatio) {
  if (typeof window === "undefined") return 1;
  const deviceDpr = window.devicePixelRatio || 1;
  const qualityCap = qualityDprCaps[quality] || qualityDprCaps.balanced;
  return Math.max(1, Math.min(deviceDpr, qualityCap, maxDevicePixelRatio));
}

function getPointerPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {
    x,
    y,
    normalizedX: rect.width ? x / rect.width : 0,
    normalizedY: rect.height ? y / rect.height : 0,
    width: rect.width,
    height: rect.height,
  };
}

const SimulationCanvas2DViewport = forwardRef(function SimulationCanvas2DViewport(
  {
    running = false,
    draw,
    step,
    onFrame,
    onResize,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    quality = "balanced",
    maxDevicePixelRatio = 2,
    maxDt = 1 / 20,
    animateWhenPaused = false,
    background = "#020617",
    className,
    canvasId,
    ariaLabel = "2D simulation canvas",
    sx = {},
    children,
  },
  ref,
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const viewportRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    frame: 0,
    elapsed: 0,
  });
  const [viewport, setViewport] = useState(viewportRef.current);

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return null;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = resolveDpr(quality, maxDevicePixelRatio);
    const backingWidth = Math.max(1, Math.floor(width * dpr));
    const backingHeight = Math.max(1, Math.floor(height * dpr));

    if (canvas.width !== backingWidth) canvas.width = backingWidth;
    if (canvas.height !== backingHeight) canvas.height = backingHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const nextViewport = {
      ...viewportRef.current,
      width,
      height,
      dpr,
      backingWidth,
      backingHeight,
    };

    viewportRef.current = nextViewport;
    setViewport(nextViewport);
    onResize?.(nextViewport);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw?.(ctx, nextViewport);
    }

    return nextViewport;
  }, [draw, maxDevicePixelRatio, onResize, quality]);

  const renderFrame = useCallback(
    (now) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const viewportState = viewportRef.current;

      if (!canvas || !ctx) return;

      const last = lastTimeRef.current || now;
      const rawDt = Math.max(0, (now - last) / 1000);
      const dt = Math.min(rawDt, maxDt);
      lastTimeRef.current = now;

      const shouldStep = running && typeof step === "function";
      if (shouldStep) step(dt, viewportState);

      const nextViewport = {
        ...viewportState,
        frame: viewportState.frame + 1,
        elapsed: viewportState.elapsed + (running ? dt : 0),
        dt,
        running,
      };

      viewportRef.current = nextViewport;
      ctx.setTransform(nextViewport.dpr, 0, 0, nextViewport.dpr, 0, 0);
      ctx.clearRect(0, 0, nextViewport.width, nextViewport.height);
      draw?.(ctx, nextViewport);
      onFrame?.(nextViewport);

      if (running || animateWhenPaused) {
        frameRef.current = window.requestAnimationFrame(renderFrame);
      } else {
        frameRef.current = 0;
      }
    },
    [animateWhenPaused, draw, maxDt, onFrame, running, step],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [resize]);

  useEffect(() => {
    if (!running && !animateWhenPaused) {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastTimeRef.current = 0;
      resize();
      return undefined;
    }

    if (!frameRef.current) {
      frameRef.current = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [animateWhenPaused, renderFrame, resize, running]);

  const handlePointer = useCallback((handler, event) => {
    const canvas = canvasRef.current;
    if (!canvas || !handler) return;
    handler(getPointerPosition(canvas, event), event);
  }, []);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getViewport: () => viewportRef.current,
    resize,
    pointerToViewport: (event) => {
      if (!canvasRef.current) return null;
      return getPointerPosition(canvasRef.current, event);
    },
  }));

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background,
        touchAction: "none",
        ...sx,
      }}
    >
      <canvas
        id={canvasId}
        ref={canvasRef}
        className={className}
        aria-label={ariaLabel}
        role="img"
        data-simulation-canvas="2d"
        data-canvas-width={viewport.width}
        data-canvas-height={viewport.height}
        onPointerDown={(event) => handlePointer(onPointerDown, event)}
        onPointerMove={(event) => handlePointer(onPointerMove, event)}
        onPointerUp={(event) => handlePointer(onPointerUp, event)}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
      {children}
    </Box>
  );
});

export default SimulationCanvas2DViewport;
