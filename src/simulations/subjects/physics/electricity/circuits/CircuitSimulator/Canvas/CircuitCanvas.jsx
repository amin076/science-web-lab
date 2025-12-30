import React from "react";

/**
 * Just renders the <canvas> and wires pointer events to handlers.
 * No circuit logic inside.
 */
export default function CircuitCanvas({
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  return (
    <div className="flex-1 relative cursor-crosshair bg-[#1a1a2e] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
      />
    </div>
  );
}
