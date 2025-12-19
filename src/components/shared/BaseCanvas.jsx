import React, { useRef, useEffect, useState, useCallback } from "react";

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 500;

const BaseCanvas = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onRender,
  onClick,
  onMouseMove: onMouseMoveCallback,
}) => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (onRender) {
      onRender(ctx, { width, height, mousePos, isHovering });
    }
  }, [onRender, width, height, mousePos, isHovering]);

  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      onClick?.({ x, y });
    },
    [onClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setMousePos(pos);

      onMouseMoveCallback?.(pos);
    },
    [onMouseMoveCallback]
  );

  return (
    <div className="rounded-2xl overflow-hidden relative bg-black/40">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="w-full cursor-crosshair"
      />
    </div>
  );
};

export default BaseCanvas;
