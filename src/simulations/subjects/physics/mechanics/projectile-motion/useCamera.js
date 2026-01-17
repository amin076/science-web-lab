// src/simulations/subjects/physics/mechanics/projectile-motion/hooks/useCamera.js
import { useRef, useEffect, useCallback } from "react";

/**
 * useCamera Hook
 * Handles panning (x-axis), zooming, and automatic initial positioning.
 *
 * @param {HTMLCanvasElement} canvasElement
 * @param {Object} initialWorldBounds - { minX, maxX, minY, maxY } calculated from objects
 * @param {number} fixedGroundLevelPx - Screen pixels from bottom where y=0 should be locked
 */
export const useCamera = (
  canvasElement,
  initialWorldBounds,
  fixedGroundLevelPx = 60
) => {
  // Initial default state (will be overwritten by resetView)
  const viewRef = useRef({ scale: 10, x: 0, y: fixedGroundLevelPx });

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Function to calculate and set the ideal starting view
  const resetView = useCallback(() => {
    if (!canvasElement || !initialWorldBounds) return;

    const { width } = canvasElement.getBoundingClientRect();

    // 1. Calculate ideal scale to fit the world width
    const worldWidth = initialWorldBounds.maxX - initialWorldBounds.minX;
    // Add margin (1.4x factor ensures space on sides)
    let newScale = width / (worldWidth * 1.4);

    // Clamp scale to reasonable limits
    newScale = Math.max(1, Math.min(30, newScale));

    // 2. Calculate X offset (Panning)
    // We want the center of the world content to be at the center of the screen
    // screenX = worldX * scale + offsetX
    // offsetX = screenX - worldX * scale
    const worldCenterX =
      (initialWorldBounds.minX + initialWorldBounds.maxX) / 2;
    const screenCenterX = width / 2;
    const newX = screenCenterX - worldCenterX * newScale;

    // 3. Y offset is fixed by design (Ground level locked)
    // worldY=0 maps to screenY = canvasHeight - (0 * scale + offsetY)
    // We want that screenY to be (canvasHeight - fixedGroundLevelPx)
    // So offsetY must equal fixedGroundLevelPx
    const newY = fixedGroundLevelPx;

    viewRef.current = { scale: newScale, x: newX, y: newY };
  }, [canvasElement, initialWorldBounds, fixedGroundLevelPx]);

  useEffect(() => {
    if (!canvasElement) return;

    // Auto-reset view on mount once canvas is ready
    resetView();

    const handleWheel = (e) => {
      e.preventDefault();
      const factor = 1.1;
      const v = viewRef.current;

      // Zoom logic
      let newScale = e.deltaY < 0 ? v.scale * factor : v.scale / factor;
      newScale = Math.max(0.5, Math.min(100, newScale)); // Clamp zoom limits

      viewRef.current = { ...v, scale: newScale };
    };

    const handleMouseDown = (e) => {
      // Allow drag on Left Click (0) or Right Click (2)
      if (e.button === 2 || e.button === 0) {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        canvasElement.style.cursor = "grabbing";
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - lastMousePos.current.x;
        // const dy = e.clientY - lastMousePos.current.y; // Y-movement disabled for this sim

        const v = viewRef.current;
        // We ONLY update x to keep the road fixed at the bottom
        viewRef.current = { ...v, x: v.x + dx };

        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvasElement.style.cursor = "default";
    };

    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    canvasElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvasElement.removeEventListener("wheel", handleWheel);
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasElement, resetView]);

  // Expose the resetView function on the ref object itself so parents can call it
  viewRef.current.resetView = resetView;

  return viewRef;
};