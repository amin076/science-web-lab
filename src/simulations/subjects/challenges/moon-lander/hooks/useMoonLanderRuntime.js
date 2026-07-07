import { useCallback, useEffect, useRef, useState } from "react";
import {
  MOON_LANDER_STATUS,
  createMoonLanderEngine,
} from "../engine/moonLanderEngine";

const FRAME_DELTA_LIMIT = 1 / 30;
const KEY_TO_CONTROL = {
  ArrowUp: "mainThrust",
  w: "mainThrust",
  W: "mainThrust",
  ArrowLeft: "rotateLeft",
  a: "rotateLeft",
  A: "rotateLeft",
  ArrowRight: "rotateRight",
  d: "rotateRight",
  D: "rotateRight",
};

function createDefaultInput() {
  return {
    mainThrust: false,
    rotateLeft: false,
    rotateRight: false,
  };
}

function isTerminalStatus(status) {
  return (
    status === MOON_LANDER_STATUS.LANDED ||
    status === MOON_LANDER_STATUS.CRASHED
  );
}

export default function useMoonLanderRuntime() {
  const engineRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(null);
  const inputRef = useRef(createDefaultInput());
  const pressedKeysRef = useRef(new Set());
  const [state, setState] = useState(null);
  const [input, setInput] = useState(createDefaultInput);

  if (!engineRef.current) {
    engineRef.current = createMoonLanderEngine();
  }

  const publishInput = useCallback((nextInput) => {
    inputRef.current = nextInput;
    setInput(nextInput);
  }, []);

  const setControlActive = useCallback(
    (control, active) => {
      const current = engineRef.current.getState();

      if (active && current.status === MOON_LANDER_STATUS.READY) {
        setState(engineRef.current.resume());
      }

      publishInput({
        ...inputRef.current,
        [control]: Boolean(active),
      });
    },
    [publishInput]
  );

  const pause = useCallback(() => {
    setState(engineRef.current.pause());
  }, []);

  const resume = useCallback(() => {
    setState(engineRef.current.resume());
  }, []);

  const start = useCallback(() => {
    lastFrameRef.current = null;
    setState(engineRef.current.resume());
  }, []);

  const togglePause = useCallback(() => {
    const current = engineRef.current.getState();

    if (current.status === MOON_LANDER_STATUS.PAUSED) {
      setState(engineRef.current.resume());
      return;
    }

    if (current.status === MOON_LANDER_STATUS.READY) {
      setState(engineRef.current.resume());
      return;
    }

    if (!isTerminalStatus(current.status)) {
      setState(engineRef.current.pause());
    }
  }, []);

  const reset = useCallback(() => {
    pressedKeysRef.current.clear();
    publishInput(createDefaultInput());
    engineRef.current.reset();
    lastFrameRef.current = null;
    setState(engineRef.current.resume());
  }, [publishInput]);

  useEffect(() => {
    setState(engineRef.current.getState());
  }, []);

  useEffect(() => {
    function tick(timestamp) {
      const lastFrame = lastFrameRef.current ?? timestamp;
      const deltaSeconds = Math.min(
        (timestamp - lastFrame) / 1000,
        FRAME_DELTA_LIMIT
      );

      lastFrameRef.current = timestamp;

      const current = engineRef.current.getState();
      if (current.status === MOON_LANDER_STATUS.RUNNING) {
        setState(engineRef.current.update(deltaSeconds, inputRef.current));
      }

      animationRef.current = window.requestAnimationFrame(tick);
    }

    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const control = KEY_TO_CONTROL[event.key];

      if (control) {
        event.preventDefault();
        pressedKeysRef.current.add(event.key);
        setControlActive(control, true);
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePause();
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        reset();
      }
    }

    function handleKeyUp(event) {
      const control = KEY_TO_CONTROL[event.key];

      if (!control) return;

      event.preventDefault();
      pressedKeysRef.current.delete(event.key);
      const stillPressed = [...pressedKeysRef.current].some(
        (key) => KEY_TO_CONTROL[key] === control
      );

      setControlActive(control, stillPressed);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [reset, setControlActive, togglePause]);

  return {
    state,
    input,
    pause,
    resume,
    start,
    reset,
    togglePause,
    setControlActive,
    isPaused: state?.status === MOON_LANDER_STATUS.PAUSED,
    isReady: state?.status === MOON_LANDER_STATUS.READY,
    isFinished: isTerminalStatus(state?.status),
  };
}
