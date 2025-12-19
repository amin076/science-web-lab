// src/components/features/electricity/CoulombsLaw3DSimulator.jsx
import React, { useRef, useLayoutEffect, useMemo, useState } from "react";
import ThreeDCanvas from "@/components/shared/ThreeDCanvas";
import {
  Sphere,
  Text,
  Line,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import * as THREE from "three";
import CoulombsLawControls from "./components/CoulombsLawControls";
import { useElectromagnetism } from "./hooks/useElectromagnetism";

// --- COMPONENT: 3D ELECTRIC FIELD (Arrows on Grid) ---
const ElectricField3D = ({ q1, q2, pos1, pos2 }) => {
  const groupRef = useRef();

  // Create a pool of ArrowHelpers to reuse (Performance optimization)
  // Grid: 9x9x9 = ~700 arrows
  const arrowPool = useMemo(() => {
    const pool = [];
    const count = 750;
    for (let i = 0; i < count; i++) {
      // Default arrow
      pool.push(
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0),
          0,
          0x00ffff
        )
      );
    }
    return pool;
  }, []);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // Clear previous frame
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    let arrowIdx = 0;
    const range = 8;
    const step = 2; // Grid density

    for (let x = -range; x <= range; x += step) {
      for (let y = -range; y <= range; y += step) {
        for (let z = -range; z <= range; z += step) {
          if (arrowIdx >= arrowPool.length) break;

          const P = new THREE.Vector3(x, y, z);

          // Vector to Q1
          const r1Vec = new THREE.Vector3(x - pos1.x, y - pos1.y, z - pos1.z);
          const r1 = r1Vec.length();

          // Vector to Q2
          const r2Vec = new THREE.Vector3(x - pos2.x, y - pos2.y, z - pos2.z);
          const r2 = r2Vec.length();

          // Skip if inside sphere
          if (r1 < 0.8 || r2 < 0.8) continue;

          // Calculate Field E
          const E = new THREE.Vector3(0, 0, 0);
          E.add(r1Vec.normalize().multiplyScalar(q1 / (r1 * r1)));
          E.add(r2Vec.normalize().multiplyScalar(q2 / (r2 * r2)));

          const mag = E.length();
          if (mag < 0.01) continue;

          // --- SCALING LOGIC (Matches 2D) ---
          // Use power law to exaggerate strong fields while keeping weak ones visible
          const scaleFactor = Math.pow(mag, 0.4);
          const length = Math.min(Math.max(scaleFactor * 0.8, 0.4), 2.5); // Min 0.4 units, Max 2.5 units

          // Opacity/Color logic
          // Three.js ArrowHelper doesn't support alpha easily on the fly without material cloning
          // So we stick to a solid color but scale size

          const arrow = arrowPool[arrowIdx];
          arrow.position.copy(P);
          arrow.setDirection(E.normalize());
          arrow.setLength(length, length * 0.25, length * 0.1); // Length, HeadLen, HeadWidth

          group.add(arrow);
          arrowIdx++;
        }
      }
    }
  }, [q1, q2, pos1, pos2, arrowPool]);

  return <group ref={groupRef} />;
};

// --- COMPONENT: 3D FLUX LINES ---
const FluxLines3D = ({ q1, q2, pos1, pos2 }) => {
  const lines = useMemo(() => {
    const computedLines = [];
    const sphereRad = 0.5;

    const generateLine = (startPos, sign) => {
      const points = [];
      let curr = startPos.clone();
      points.push(curr.clone());

      let steps = 0;
      const maxSteps = 200; // Limit line length

      while (steps < maxSteps) {
        const r1Vec = new THREE.Vector3().subVectors(
          curr,
          new THREE.Vector3(pos1.x, pos1.y, pos1.z)
        );
        const r1 = r1Vec.length();
        const r2Vec = new THREE.Vector3().subVectors(
          curr,
          new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        );
        const r2 = r2Vec.length();

        if (r1 < sphereRad * 0.9 || r2 < sphereRad * 0.9) break;

        const E = new THREE.Vector3(0, 0, 0);
        E.add(r1Vec.normalize().multiplyScalar(q1 / (r1 * r1)));
        E.add(r2Vec.normalize().multiplyScalar(q2 / (r2 * r2)));

        const mag = E.length();
        if (mag === 0) break;

        // Adaptive step size? Fixed is safer for React
        const dir = E.normalize().multiplyScalar(sign * 0.15);
        curr.add(dir);
        points.push(curr.clone());

        if (curr.length() > 20) break;
        steps++;
      }
      return points;
    };

    // Seeds around Q1
    const count = 12;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count / 2; j++) {
        const theta = (i / count) * Math.PI * 2;
        const phi = (j / (count / 2)) * Math.PI;

        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);

        const start = new THREE.Vector3(x, y, z)
          .multiplyScalar(sphereRad * 1.1)
          .add(new THREE.Vector3(pos1.x, pos1.y, pos1.z));
        computedLines.push(generateLine(start, q1 > 0 ? 1 : -1));
      }
    }
    // Seeds around Q2
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count / 2; j++) {
        const theta = (i / count) * Math.PI * 2;
        const phi = (j / (count / 2)) * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        const start = new THREE.Vector3(x, y, z)
          .multiplyScalar(sphereRad * 1.1)
          .add(new THREE.Vector3(pos2.x, pos2.y, pos2.z));
        computedLines.push(generateLine(start, q2 > 0 ? 1 : -1));
      }
    }

    return computedLines;
  }, [q1, q2, pos1, pos2]);

  return (
    <>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#FFB74D"
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  );
};

// --- COMPONENT: FORCE ARROWS (On the Spheres) ---
const ForceArrows = ({ pos1, pos2, force }) => {
  const arrow1Ref = useRef();
  const arrow2Ref = useRef();

  useLayoutEffect(() => {
    if (!arrow1Ref.current || !arrow2Ref.current) return;
    const v1 = new THREE.Vector3(pos1.x, pos1.y, pos1.z);
    const v2 = new THREE.Vector3(pos2.x, pos2.y, pos2.z);

    const dir1to2 = new THREE.Vector3().subVectors(v2, v1).normalize();
    const dir2to1 = new THREE.Vector3().subVectors(v1, v2).normalize();

    const isRepulsive = force.direction === "repulsive";
    const dirArrow1 = isRepulsive ? dir2to1 : dir1to2;
    const dirArrow2 = isRepulsive ? dir1to2 : dir2to1;

    const length = Math.min(Math.max(force.magnitude * 0.5, 1.5), 6);
    const color = isRepulsive ? 0xff6b6b : 0x4ecdc4;

    arrow1Ref.current.position.copy(v1);
    arrow1Ref.current.setDirection(dirArrow1);
    arrow1Ref.current.setLength(length, length * 0.3, length * 0.15);
    arrow1Ref.current.setColor(color);

    arrow2Ref.current.position.copy(v2);
    arrow2Ref.current.setDirection(dirArrow2);
    arrow2Ref.current.setLength(length, length * 0.3, length * 0.15);
    arrow2Ref.current.setColor(color);
  }, [pos1, pos2, force]);

  return (
    <>
      <arrowHelper
        ref={arrow1Ref}
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          1,
          0xffffff,
        ]}
      />
      <arrowHelper
        ref={arrow2Ref}
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          1,
          0xffffff,
        ]}
      />
    </>
  );
};

const CoulombsLaw3DSimulator = () => {
  const {
    q1,
    setQ1,
    q2,
    setQ2,
    pos1,
    updatePos1,
    pos2,
    updatePos2,
    k,
    setK,
    force,
    distance,
    isSimulating,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    showField,
    setShowField,
    showFlux,
    setShowFlux,
  } = useElectromagnetism();

  const sphere1Color = q1 >= 0 ? "#ff4444" : "#4444ff";
  const sphere2Color = q2 >= 0 ? "#ff4444" : "#4444ff";

  const p1Array = [pos1.x, pos1.y, pos1.z];
  const p2Array = [pos2.x, pos2.y, pos2.z];

  return (
    <div className="h-full w-full overflow-y-auto p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Coulomb's Law (3D)
          </h1>
          <p className="text-white/70">
            Control X, Y, and Z coordinates of charges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative">
            <ThreeDCanvas
              height={600}
              cameraPosition={[0, 6, 15]}
              showStars={false} // REMOVED STARS
            >
              <gridHelper args={[30, 30, 0x444444, 0x222222]} />
              <axesHelper args={[5]} />

              <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport
                  axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
                  labelColor="white"
                />
              </GizmoHelper>

              <Line
                points={[p1Array, p2Array]}
                color="white"
                opacity={0.3}
                transparent
                lineWidth={1}
                dashed
                dashScale={2}
              />

              {/* Electric Field (Arrows) */}
              {showField && (
                <ElectricField3D q1={q1} q2={q2} pos1={pos1} pos2={pos2} />
              )}

              {/* Flux Lines (Curves) */}
              {showFlux && (
                <FluxLines3D q1={q1} q2={q2} pos1={pos1} pos2={pos2} />
              )}

              <ForceArrows pos1={pos1} pos2={pos2} force={force} />

              <Sphere position={p1Array} args={[0.5, 32, 32]}>
                <meshStandardMaterial
                  color={sphere1Color}
                  emissive={sphere1Color}
                  emissiveIntensity={0.6}
                />
                <Text
                  position={[0, 1.2, 0]}
                  fontSize={0.4}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  billboard
                >
                  {q1}μC
                </Text>
              </Sphere>

              <Sphere position={p2Array} args={[0.5, 32, 32]}>
                <meshStandardMaterial
                  color={sphere2Color}
                  emissive={sphere2Color}
                  emissiveIntensity={0.6}
                />
                <Text
                  position={[0, 1.2, 0]}
                  fontSize={0.4}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  billboard
                >
                  {q2}μC
                </Text>
              </Sphere>
            </ThreeDCanvas>

            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white text-xs p-3 rounded-lg border border-white/10 pointer-events-none">
              <p className="font-bold mb-1">Controls:</p>
              <ul className="space-y-1 text-white/70">
                <li>🖱️ Left Click + Drag: Rotate</li>
                <li>🖱️ Right Click + Drag: Pan</li>
                <li>🖱️ Scroll: Zoom</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <CoulombsLawControls
              q1={q1}
              setQ1={setQ1}
              q2={q2}
              setQ2={setQ2}
              pos1={pos1}
              updatePos1={updatePos1}
              pos2={pos2}
              updatePos2={updatePos2}
              k={k}
              setK={setK}
              force={force}
              distance={distance}
              isSimulating={isSimulating}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              showZ={true}
              showField={showField}
              setShowField={setShowField}
              showFlux={showFlux}
              setShowFlux={setShowFlux}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoulombsLaw3DSimulator;
