import React, { forwardRef, useEffect, useRef } from "react";
import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { createThreeOrbitCameraAdapter } from "./threeOrbitCameraAdapter.js";
import { interpolateCameraState } from "./cameraSessionTransition.js";
import { subscribeCameraSnapshot } from "./cameraSessionBus.js";

const DEFAULT_CAMERA = Object.freeze({x:0,y:0,zoom:1,yawDegrees:0,pitchDegrees:0});
function RemoteOrbitBridge({ controlsRef }) {
  const camera = useThree(state => state.camera);
  const adapterRef = useRef(null);
  const applied = useRef({...DEFAULT_CAMERA});
  const latest = useRef(null);
  const tween = useRef(null);

  useEffect(() => subscribeCameraSnapshot(snapshot => {
    if (!snapshot) {
      latest.current = null;
      tween.current = null;
      return;
    }
    if (latest.current?.revision !== snapshot.revision) {
      latest.current = snapshot;
      tween.current = null;
    }
  }), []);
  useEffect(() => {
    adapterRef.current = null;
    return () => { adapterRef.current = null; };
  }, [camera]);
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !latest.current) return;
    if (!adapterRef.current) adapterRef.current = createThreeOrbitCameraAdapter({camera,controls});
    const snapshot = latest.current;
    if (!tween.current) {
      const target = {...DEFAULT_CAMERA,...snapshot};
      const duration = snapshot.durationSeconds ?? 0;
      tween.current = {start:{...applied.current},target,duration,elapsed:0,
        easing:snapshot.easing ?? "easeInOut",revision:snapshot.revision};
    }
    const t = tween.current;
    t.elapsed = Math.min(t.duration,t.elapsed+Math.max(delta,0));
    const next = interpolateCameraState(t.start,t.target,t.duration ? t.elapsed/t.duration : 1,t.easing);
    const prior = applied.current;
    const adapter = adapterRef.current;
    if (next.zoom !== prior.zoom) adapter.zoom({factor:next.zoom/prior.zoom});
    if (next.yawDegrees !== prior.yawDegrees || next.pitchDegrees !== prior.pitchDegrees)
      adapter.orbit({yawDegrees:next.yawDegrees-prior.yawDegrees,pitchDegrees:next.pitchDegrees-prior.pitchDegrees});
    if (next.x !== prior.x || next.y !== prior.y)
      adapter.pan({horizontal:next.x-prior.x,vertical:next.y-prior.y});
    applied.current = next;
  });
  return null;
}

/** Automatically replaces the Drei OrbitControls in recognized 3D simulation sources.
 * Original props, children and refs are preserved; user interaction still works.
 */
export const AutoOrbitControls = forwardRef(function AutoOrbitControls(props, forwardedRef) {
  const localRef = useRef(null);
  const assignRef = control => {
    localRef.current = control;
    if (typeof forwardedRef === "function") forwardedRef(control);
    else if (forwardedRef) forwardedRef.current = control;
  };
  return <>
    <DreiOrbitControls {...props} ref={assignRef}/>
    <RemoteOrbitBridge controlsRef={localRef}/>
  </>;
});
