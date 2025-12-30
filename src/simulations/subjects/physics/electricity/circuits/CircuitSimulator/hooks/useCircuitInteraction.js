// src/components/features/circuits/CircuitSimulator/hooks/useCircuitInteraction.js
import { useCallback, useRef } from "react";
import {
  getTerminalPositions,
  isNearTerminal,
  generateId,
  COMPONENT_TYPES,
} from "../../CircuitUtils";

export function useCircuitInteraction({ state, dispatch, canvasRef }) {
  const { components, connections, connectingFrom, dragState } = state;

  // Track where the mouse started to distinguish Click vs Drag
  const dragStartPosRef = useRef(null);

  const isTerminalConnected = useCallback(
    (compId, terminal) => {
      return connections.some(
        (c) =>
          (c.fromComponent === compId && c.fromTerminal === terminal) ||
          (c.toComponent === compId && c.toTerminal === terminal)
      );
    },
    [connections]
  );

  const findTerminal = useCallback(
    (x, y) => {
      for (const comp of components) {
        const t = getTerminalPositions(comp);
        if (isNearTerminal(x, y, t.left))
          return { componentId: comp.id, terminal: "left", position: t.left };
        if (isNearTerminal(x, y, t.right))
          return { componentId: comp.id, terminal: "right", position: t.right };
      }
      return null;
    },
    [components]
  );

  const toCanvasXY = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [canvasRef]
  );

  const onPointerDown = useCallback(
    (e) => {
      const { x, y } = toCanvasXY(e);
      dragStartPosRef.current = { x, y }; // Record start position

      // 1. Check Terminal (For wiring)
      const terminal = findTerminal(x, y);

      if (terminal) {
        const termComp = components.find((c) => c.id === terminal.componentId);
        const isNode = termComp?.type === COMPONENT_TYPES.NODE;

        // A) FINISHING A WIRE (Always takes priority)
        if (connectingFrom) {
          if (connectingFrom.componentId !== terminal.componentId) {
            dispatch({
              type: "ADD_CONNECTION",
              connection: {
                id: generateId(),
                fromComponent: connectingFrom.componentId,
                fromTerminal: connectingFrom.terminal,
                toComponent: terminal.componentId,
                toTerminal: terminal.terminal,
              },
            });
          }
          dispatch({
            type: "SET_INTERACTION",
            patch: { connectingFrom: null },
          });
          return;
        }

        // B) STARTING A WIRE (Special Logic for Nodes)
        // If it's a NODE, we don't start wiring immediately. We wait to see if user drags.
        // If it's a Component, we start wiring immediately (standard behavior).
        if (!isNode) {
          dispatch({
            type: "SET_INTERACTION",
            patch: { connectingFrom: terminal },
          });
          return;
        }

        // If it IS a Node, we fall through to Select/Drag logic below.
        // We will handle the "Click to Wire" logic in onPointerUp.
      }

      // Cancel wire if clicking empty space
      if (connectingFrom) {
        dispatch({ type: "SET_INTERACTION", patch: { connectingFrom: null } });
        return;
      }

      // 2. Component Selection / Dragging
      const clickedComp = components.find(
        (c) => Math.hypot(c.x - x, c.y - y) < 30
      );

      if (clickedComp) {
        dispatch({ type: "SELECT", id: clickedComp.id });
        dispatch({
          type: "SET_INTERACTION",
          patch: {
            dragState: {
              id: clickedComp.id,
              offsetX: x - clickedComp.x,
              offsetY: y - clickedComp.y,
            },
          },
        });
      } else {
        dispatch({ type: "SELECT", id: null });
      }
    },
    [components, connectingFrom, dispatch, findTerminal, toCanvasXY]
  );

  const onPointerMove = useCallback(
    (e) => {
      const { x, y } = toCanvasXY(e);
      dispatch({ type: "SET_INTERACTION", patch: { mousePos: { x, y } } });

      // Handle Dragging
      if (dragState) {
        dispatch({
          type: "UPDATE_COMPONENT",
          id: dragState.id,
          patch: { x: x - dragState.offsetX, y: y - dragState.offsetY },
        });
        return;
      }

      // Hover Terminal Highlight
      const t = findTerminal(x, y);
      dispatch({
        type: "SET_INTERACTION",
        patch: {
          hoveredTerminal: t
            ? { componentId: t.componentId, terminal: t.terminal }
            : null,
        },
      });
    },
    [dispatch, dragState, findTerminal, toCanvasXY]
  );

  const onPointerUp = useCallback(
    (e) => {
      const { x, y } = toCanvasXY(e);

      // SMART INTERACTION CHECK:
      // Did we barely move the mouse? (Less than 5px)
      // If so, it was a CLICK, not a DRAG.
      const start = dragStartPosRef.current;
      const dist = start ? Math.hypot(x - start.x, y - start.y) : 0;
      const isClick = dist < 5;

      // Check if we are releasing on a Node
      if (isClick && !state.connectingFrom) {
        const terminal = findTerminal(x, y);
        if (terminal) {
          const termComp = state.components.find(
            (c) => c.id === terminal.componentId
          );
          // If we clicked a NODE without dragging, START WIRING!
          if (termComp?.type === COMPONENT_TYPES.NODE) {
            dispatch({
              type: "SET_INTERACTION",
              patch: { connectingFrom: terminal },
            });
          }
        }
      }

      dispatch({ type: "SET_INTERACTION", patch: { dragState: null } });
      dragStartPosRef.current = null;
    },
    [dispatch, toCanvasXY, findTerminal, state.connectingFrom, state.components]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isTerminalConnected,
  };
}
