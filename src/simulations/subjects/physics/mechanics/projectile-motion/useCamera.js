// src/simulations/subjects/physics/mechanics/projectile-motion/hooks/useCamera.js
import { useRef, useEffect } from 'react';

export const useCamera = (canvasElement, initialView = { scale: 3, x: 150, y: 150 }) => {
  // We keep the view state in a Ref so changing it doesn't trigger React re-renders (for performance)
  const viewRef = useRef(initialView);
  
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only run if the canvas element actually exists
    if (!canvasElement) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Stop page scrolling
      const factor = 1.1;
      const v = viewRef.current;
      
      // Zoom centered on mouse pointer could be added here, 
      // but simple center zoom is safer for now.
      let newScale = e.deltaY < 0 ? v.scale * factor : v.scale / factor;
      newScale = Math.max(0.5, Math.min(20, newScale)); // Clamp limits
      
      viewRef.current = { ...v, scale: newScale };
    };

    const handleMouseDown = (e) => {
      if (e.button === 2) { // Right Click
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        canvasElement.style.cursor = "grabbing";
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        
        const v = viewRef.current;
        // Update View Position (Pan)
        viewRef.current = { ...v, x: v.x + dx, y: v.y - dy };
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvasElement.style.cursor = "default";
    };

    // Attach listeners
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvasElement.removeEventListener('wheel', handleWheel);
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasElement]); // Re-run only when canvasElement is ready

  return viewRef;
};