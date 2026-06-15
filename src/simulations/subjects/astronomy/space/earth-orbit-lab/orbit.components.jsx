// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.components.jsx

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line as DreiLine, useGLTF } from "@react-three/drei";
import { toRenderUnits, R_EARTH_M } from "./orbit.physics";
import { hasLineOfSight, elevationDeg } from "./orbit.visibility";
import { TiangongVisual } from "./orbit.tiangong";
/* --- Camera Controller --- */
export function CameraController({
  focusedBodyId,
  bodies,
  moonRef,
  mPerUnit,
  controlsRef,
  getBodyDistanceScale = () => 1,
}) {
  const { camera } = useThree();

  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const cameraGoal = useRef(new THREE.Vector3(0, 5, 20));
  const previousId = useRef(null);

  const userInteractingRef = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      userInteractingRef.current = true;
    };

    const handleEnd = () => {
      userInteractingRef.current = true;
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);

    return () => {
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
    };
  }, [controlsRef]);

  function getFocusDistance(body) {
    if (!body) return 4;

    const name = body.name?.toLowerCase() || "";

    if (body.parent === "sun-earth-l2" || name.includes("james webb")) {
      return 0.28;
    }

    if (name.includes("iss")) return 0.16;
    if (name.includes("tiangong")) return 0.18;
    if (name.includes("hubble")) return 0.11;
    if (name.includes("gps")) return 0.13;
    if (name.includes("starlink")) return 0.08;
    if (name.includes("gateway")) return 0.16;

    return 0.18;
  }

  function getBodyWorldPosition(body) {
    const distanceScale = getBodyDistanceScale(body);
    const rRaw = toRenderUnits(body.state.r, mPerUnit);

    const rRel = new THREE.Vector3(
      rRaw[0] * distanceScale,
      rRaw[1] * distanceScale,
      rRaw[2] * distanceScale,
    );

    if (body.parent === "moon" && moonRef.current) {
      return moonRef.current.position.clone().add(rRel);
    }

    return rRel;
  }

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const focusChanged = focusedBodyId !== previousId.current;

    // If user moved mouse, keep manual camera.
    // But if a NEW object is selected, allow focus to run.
    if (userInteractingRef.current && !focusChanged) {
      controls.update();
      return;
    }

    if (focusChanged) {
      userInteractingRef.current = false;
    }

    const desiredTarget = new THREE.Vector3(0, 0, 0);
    let desiredCamera = null;

    if (!focusedBodyId || focusedBodyId === "earth") {
      desiredTarget.set(0, 0, 0);
      desiredCamera = new THREE.Vector3(0, 2.2, 5.5);
    } else if (focusedBodyId === "moon" && moonRef.current) {
      desiredTarget.copy(moonRef.current.position);

      const moonDir =
        desiredTarget.length() > 0.0001
          ? desiredTarget.clone().normalize()
          : new THREE.Vector3(0, 0, 1);

      desiredCamera = desiredTarget
        .clone()
        .add(
          new THREE.Vector3(0.5, 0.25, 0.9).applyQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              moonDir,
            ),
          ),
        );
    } else {
      const body = bodies.find((b) => b.id === focusedBodyId);
      if (!body) return;

      desiredTarget.copy(getBodyWorldPosition(body));

      const name = body.name?.toLowerCase() || "";
      const focusDistance = getFocusDistance(body);

      const radialDir =
        desiredTarget.length() > 0.0001
          ? desiredTarget.clone().normalize()
          : new THREE.Vector3(0, 0, 1);

      let sideDir = new THREE.Vector3(0, 1, 0).cross(radialDir);

      if (sideDir.lengthSq() < 0.001) {
        sideDir = new THREE.Vector3(1, 0, 0);
      } else {
        sideDir.normalize();
      }

      const upDir = radialDir.clone().cross(sideDir).normalize();

      const isJWST =
        body.parent === "sun-earth-l2" || name.includes("james webb");

      if (isJWST) {
        desiredCamera = desiredTarget
          .clone()
          .add(sideDir.clone().multiplyScalar(focusDistance * 0.3))
          .add(upDir.clone().multiplyScalar(focusDistance * 0.25))
          .add(radialDir.clone().multiplyScalar(focusDistance));
      } else {
        desiredCamera = desiredTarget
          .clone()
          .add(radialDir.clone().multiplyScalar(focusDistance))
          .add(upDir.clone().multiplyScalar(focusDistance * 0.45))
          .add(sideDir.clone().multiplyScalar(focusDistance * 0.25));
      }
    }

    if (!desiredCamera) return;

    if (focusChanged) {
      targetVec.current.copy(desiredTarget);
      cameraGoal.current.copy(desiredCamera);

      camera.position.copy(desiredCamera);
      controls.target.copy(desiredTarget);

      previousId.current = focusedBodyId;
    } else {
      targetVec.current.lerp(desiredTarget, 0.12);
      cameraGoal.current.lerp(desiredCamera, 0.12);

      camera.position.lerp(cameraGoal.current, 0.16);
      controls.target.copy(targetVec.current);
    }

    camera.lookAt(targetVec.current);
    controls.update();
  });

  return null;
}

function GLBModel({ url, scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return <primitive object={clonedScene} scale={scale} rotation={rotation} />;
}

useGLTF.preload("/JamesWebb.glb");
useGLTF.preload("/Hubble.glb");
useGLTF.preload("/iss.glb");
useGLTF.preload("/gps.glb");

/* --- Visuals --- */
function SatelliteVisual({ type, color, scaleFactor = 1 }) {
  const baseSize = 0.05;
  const s = baseSize * scaleFactor;

  if (type === "station") {
    return (
      <group rotation={[0, Math.PI / 4, 0]} scale={s * 2}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>

        <mesh>
          <boxGeometry args={[0.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#888" />
        </mesh>

        {[-0.4, -0.25, 0.25, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.01]} />
            <meshStandardMaterial color="#b87333" />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "telescope") {
    return (
      <group rotation={[Math.PI / 3, 0, 0]} scale={s * 1.5}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
          <meshStandardMaterial color="silver" />
        </mesh>

        <mesh position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.01]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>

        <mesh position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.01]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>
      </group>
    );
  }

  return (
    <group rotation={[0, Math.PI / 4, 0]} scale={s}>
      <mesh>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.01]} />
        <meshStandardMaterial color="#1a237e" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0.25, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.01]} />
        <meshStandardMaterial color="#1a237e" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function getModelScale(body, visualScale) {
  const name = body.name?.toLowerCase() || "";

  if (name.includes("james webb")) return 0.0002 * visualScale;
  if (name.includes("hubble")) return 0.00002 * visualScale;
  if (name.includes("iss")) return 0.00045 * visualScale;
  if (name.includes("gps")) return 0.00025 * visualScale;

  return 1 * visualScale;
}

export function OrbitPathVisual({
  pathData,
  mPerUnit,
  color,
  opacity = 0.3,
  distanceScale = 1,
}) {
  const points = useMemo(
    () =>
      pathData.map((p) => {
        const r = toRenderUnits(p, mPerUnit);

        return new THREE.Vector3(
          r[0] * distanceScale,
          r[1] * distanceScale,
          r[2] * distanceScale,
        );
      }),
    [pathData, mPerUnit, distanceScale],
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((v) => [v.x, v.y, v.z]))}
          itemSize={3}
        />
      </bufferGeometry>

      <lineBasicMaterial
        color={color}
        opacity={opacity}
        transparent
        linewidth={1}
      />
    </line>
  );
}

export function OrbitalTrail({ body, color, visible, distanceScale = 1 }) {
  const lineRef = useRef();
  const maxPoints = 900;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array((maxPoints + 1) * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!lineRef.current || !visible || !body) return;

    const positions = lineRef.current.geometry.attributes.position.array;
    const trailData = body.trail;
    const count = Math.min(trailData.length, maxPoints);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = trailData[i][0] * distanceScale;
      positions[i * 3 + 1] = trailData[i][1] * distanceScale;
      positions[i * 3 + 2] = trailData[i][2] * distanceScale;
    }

    lineRef.current.geometry.setDrawRange(0, count);
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={lineRef} geometry={geometry} visible={visible}>
      <lineBasicMaterial
        color={color}
        linewidth={1}
        opacity={0.8}
        transparent
      />
    </line>
  );
}

export function GroundTelescope({ observerRenderRef }) {
  const meshRef = useRef();
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(() => {
    if (!meshRef.current || !observerRenderRef.current) return;

    const p = observerRenderRef.current;

    meshRef.current.position.set(p[0], p[1], p[2]);

    const normal = new THREE.Vector3(p[0], p[1], p[2]).normalize();
    meshRef.current.quaternion.setFromUnitVectors(up, normal);
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.02, 0.08, 16]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

export function LOSLine({
  fromRef,
  toBody,
  parentRef,
  mPerUnit,
  enabled,
  showOnlyVisible,
}) {
  const lineRef = useRef(null);

  useFrame(() => {
    if (!enabled || !lineRef.current || !fromRef.current) return;

    const shouldShow = showOnlyVisible ? !!toBody.lastVisible : true;
    lineRef.current.visible = shouldShow;

    if (!shouldShow) return;

    const a = fromRef.current;
    const relPos = toRenderUnits(toBody.state.r, mPerUnit);
    let b = relPos;

    if (parentRef && parentRef.current) {
      const pPos = parentRef.current.position;
      b = [pPos.x + relPos[0], pPos.y + relPos[1], pPos.z + relPos[2]];
    }

    if (lineRef.current.geometry?.setPositions) {
      lineRef.current.geometry.setPositions([
        a[0],
        a[1],
        a[2],
        b[0],
        b[1],
        b[2],
      ]);
    }

    if (lineRef.current.material?.color?.set) {
      lineRef.current.material.color.set(
        toBody.lastVisible ? "#4ECDC4" : "#ef4444",
      );
    }
  });

  if (!enabled) return null;

  return (
    <DreiLine
      ref={lineRef}
      points={[
        [0, 0, 0],
        [0, 0, 0],
      ]}
      color="#4ECDC4"
      lineWidth={1}
      transparent
      opacity={0.6}
      dashed
      dashSize={0.15}
      gapSize={0.12}
    />
  );
}

function getOrbitColor(body) {
  const name = body.name?.toLowerCase() || "";

  if (body.parent === "moon") return "#C0C0C0";
  if (name.includes("iss")) return "#00E5FF";
  if (name.includes("tiangong")) return "#00BCD4";
  if (name.includes("hubble")) return "#7C4DFF";
  if (name.includes("gps")) return "#FFD54F";
  if (name.includes("starlink")) return "#4CAF50";

  return body.color;
}

function getOrbitOpacity(body) {
  if (body.parent === "moon") return 0.9;

  const name = body.name?.toLowerCase() || "";

  if (name.includes("gps")) return 0.8;

  return 0.5;
}

function shouldShowLabel(body, visualScale) {
  const name = body.name?.toLowerCase() || "";

  if (body.parent === "sun-earth-l2") return true;
  if (name.includes("james webb")) return true;
  if (name.includes("gateway")) return true;
  if (name.includes("moon")) return true;

  return visualScale > 0.35;
}

export function SatelliteBody({
  body,
  mPerUnit,
  observerMetersRef,
  showLabels,
  showOrbits,
  showVelocityVectors,
  showOnlyVisible,
  velocityVisualScale = 200,
  visualScale = 1,
  distanceScale = 1,
}) {
  const groupRef = useRef();
  const objectRef = useRef();
  const arrowRef = useRef(null);
  const smoothPosRef = useRef(new THREE.Vector3());

  const isJWST =
    body.parent === "sun-earth-l2" ||
    body.name?.toLowerCase().includes("james webb");

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0.2,
      body.color,
    );

    arrow.visible = false;
    arrowRef.current = arrow;
    group.add(arrow);

    return () => {
      if (arrowRef.current) group.remove(arrowRef.current);
    };
  }, [body.color]);

  useFrame(() => {
    if (!objectRef.current || !groupRef.current) return;

    const pRaw = toRenderUnits(body.state.r, mPerUnit);

    const p = [
      pRaw[0] * distanceScale,
      pRaw[1] * distanceScale,
      pRaw[2] * distanceScale,
    ];

    const targetPos = new THREE.Vector3(p[0], p[1], p[2]);

    if (smoothPosRef.current.lengthSq() === 0) {
      smoothPosRef.current.copy(targetPos);
    } else {
      smoothPosRef.current.lerp(targetPos, 0.18);
    }

    objectRef.current.position.copy(smoothPosRef.current);

    const obs = observerMetersRef ? observerMetersRef.current : null;

    let visible = true;

    if (obs && body.parent === "earth" && !isJWST) {
      visible = hasLineOfSight(obs, body.state.r, R_EARTH_M);

      if (elevationDeg(obs, body.state.r) <= 0) {
        visible = false;
      }
    }

    body.lastVisible = visible;
    groupRef.current.visible = showOnlyVisible ? visible : true;

    if (arrowRef.current) {
      const vRender = toRenderUnits(body.state.v, mPerUnit);
      const vVec = new THREE.Vector3(vRender[0], vRender[1], vRender[2]);
      const speed = vVec.length();

      if (
        showVelocityVectors &&
        speed > 1e-6 &&
        (!showOnlyVisible || visible) &&
        body.type !== "fixed-point"
      ) {
        arrowRef.current.visible = true;
        arrowRef.current.position.set(p[0], p[1], p[2]);
        arrowRef.current.setDirection(vVec.normalize());

        arrowRef.current.setLength(
          THREE.MathUtils.clamp(speed * velocityVisualScale, 0.08, 0.65),
          0.06,
          0.035,
        );
      } else {
        arrowRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {showOrbits && body.type !== "fixed-point" && (
        <OrbitPathVisual
          pathData={body.orbitPath}
          mPerUnit={mPerUnit}
          color={getOrbitColor(body)}
          opacity={getOrbitOpacity(body)}
          distanceScale={distanceScale}
        />
      )}

      <group ref={objectRef}>
        {isJWST ? (
          <GLBModel
            url="/JamesWebb.glb"
            scale={getModelScale(body, visualScale)}
            rotation={[Math.PI / 2, Math.PI / 2, 0]}
          />
        ) : body.name?.toLowerCase().includes("tiangong") ? (
          <TiangongVisual scale={0.008 * visualScale} />
        ) : body.name?.toLowerCase().includes("hubble") ? (
          <GLBModel
            url="/Hubble.glb"
            scale={getModelScale(body, visualScale)}
            rotation={[0.4, -0.6, 0.2]}
          />
        ) : body.name?.toLowerCase().includes("gateway") ? (
          <GLBModel
            url="/Gateway.glb"
            scale={0.0008 * visualScale}
            rotation={[Math.PI / 2, Math.PI / 2, 0]}
          />
        ) : body.name?.toLowerCase().includes("iss") ? (
          <GLBModel
            url="/iss.glb"
            scale={getModelScale(body, visualScale)}
            rotation={[Math.PI / 2, Math.PI / 2, 0]}
          />
        ) : body.name?.toLowerCase().includes("gps") ? (
          <GLBModel
            url="/gps.glb"
            scale={getModelScale(body, visualScale)}
            rotation={[0.4, -0.6, 0.2]}
          />
        ) : (
          <SatelliteVisual
            type={body.type}
            color={body.color}
            scaleFactor={visualScale}
          />
        )}

        {showLabels && shouldShowLabel(body, visualScale) && (
          <Html
            center
            position={[0, isJWST ? 0.28 : 0.12 * visualScale, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                padding: "2px 6px",
                borderRadius: 8,
                background: isJWST ? "rgba(20,12,0,0.78)" : "rgba(0,0,0,0.6)",
                color: isJWST ? "#FFA726" : body.color,
                fontSize: isJWST ? 11 : 10,
                fontWeight: isJWST ? 800 : 600,
                border: `1px solid ${isJWST ? "#FFA726" : body.color}`,
                whiteSpace: "nowrap",
                boxShadow: isJWST ? "0 0 10px #FFA726" : "none",
              }}
            >
              {isJWST ? "JWST at Sun–Earth L2" : body.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

export function LagrangePointMarkers({
  pointsMeters = [],
  mPerUnit,
  distanceScale = 1,
  visible = true,
  onSelect,
}) {
  const points = useMemo(
    () =>
      pointsMeters.map((p) => {
        const r = toRenderUnits(p.pos, mPerUnit);

        return {
          ...p,
          pos: [
            r[0] * distanceScale,
            r[1] * distanceScale,
            r[2] * distanceScale,
          ],
        };
      }),
    [pointsMeters, mPerUnit, distanceScale],
  );

  if (!visible) return null;

  return (
    <group>
      {points.map((p) => (
        <group key={p.id} position={p.pos}>
          {/* Tiny beacon point */}
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(p.id);
            }}
          >
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color={p.color} />
          </mesh>

          {/* Soft glow ring */}
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>

          {/* Label */}
          <Html
            center
            position={[0, 0.09, 0]}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(p.id);
              }}
              style={{
                padding: "1px 5px",
                borderRadius: 6,
                background: "rgba(0,0,0,0.65)",
                color: p.color,
                fontSize: 10,
                fontWeight: 800,
                border: `1px solid ${p.color}`,
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: `0 0 8px ${p.color}`,
              }}
            >
              {p.id}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
