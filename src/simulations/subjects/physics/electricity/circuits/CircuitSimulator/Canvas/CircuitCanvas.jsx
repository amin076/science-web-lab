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
  const handlePointerDown = (e) => {
    // جلوگیری از اسکرول/ژست روی موبایل و trackpad
    e.preventDefault?.();

    // Drag قطع نشه وقتی pointer از canvas بیرون می‌ره
    if (e.pointerId != null) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }

    onPointerDown?.(e);
  };

  const handlePointerUp = (e) => {
    e.preventDefault?.();

    if (e.pointerId != null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }

    onPointerUp?.(e);
  };

  return (
    <div className="flex-1 relative cursor-crosshair bg-[#1a1a2e] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        style={{ touchAction: "none" }} // مهم برای touch devices
        onPointerDown={handlePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
