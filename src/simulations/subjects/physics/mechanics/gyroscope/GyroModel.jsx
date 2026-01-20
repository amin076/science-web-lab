// src/simulations/subjects/physics/mechanics/gyroscope/GyroModel.jsx
import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export default function GyroModel({ 
  outerRef, 
  innerRef, 
  rotorRef, 
  params 
}) {
  // --- DIMENSIONS ---
  const R_rotor = params.diskRadius;        
  const R_inner = R_rotor + 0.03;      
  const R_outer = R_inner + 0.03;      
  const R_frame = R_outer + 0.03;      
  
  const TUBE_THICKNESS = 0.006; 
  const ROTOR_THICKNESS = 0.08; 
  const pivotHeight = R_frame + 0.25; 

  const materials = useMemo(() => ({
    brass: new THREE.MeshStandardMaterial({ color: "#fbbf24", metalness: 1, roughness: 0.1 }),
    silver: new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.9, roughness: 0.15 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: "#334155", metalness: 0.7, roughness: 0.3 }),
    rotor: new THREE.MeshStandardMaterial({ color: "#1e293b", metalness: 0.6, roughness: 0.4 }),
    stand: new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 0.5, roughness: 0.5 }),
    marker: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#aaaaaa", emissiveIntensity: 0.2, metalness: 0.5, roughness: 0.2 })
  }), []);

  return (
    <>
      <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />

      {/* --- STATIONARY BASE & FRAME --- */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.02, 0]} receiveShadow material={materials.stand}>
          <cylinderGeometry args={[0.5, 0.6, 0.04, 64]} />
        </mesh>
        
        <mesh position={[0, (pivotHeight - R_frame) / 2, 0]} castShadow material={materials.silver}>
          <cylinderGeometry args={[0.02, 0.02, pivotHeight - R_frame, 32]} />
        </mesh>

        <group position={[0, pivotHeight, 0]}>
            <mesh rotation={[0, 0, 0]} castShadow material={materials.darkMetal}>
                <torusGeometry args={[R_frame, TUBE_THICKNESS, 16, 100]} />
            </mesh>
            
            {/* Pivot Housings */}
            <mesh position={[0, R_frame, 0]} material={materials.darkMetal}>
                <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
            </mesh>
            <mesh position={[0, -R_frame, 0]} material={materials.darkMetal}>
                <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
            </mesh>

             {/* --- OUTER GIMBAL (Precession) --- */}
             <group ref={outerRef}>
                 <mesh rotation={[0, Math.PI/2, 0]} castShadow material={materials.brass}>
                    <torusGeometry args={[R_outer, TUBE_THICKNESS, 32, 100]} />
                 </mesh>
                 
                 {/* Pins */}
                 <mesh position={[0, R_outer + 0.01, 0]} material={materials.brass}>
                    <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
                 </mesh>
                 <mesh position={[0, -(R_outer + 0.01), 0]} material={materials.brass}>
                    <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
                 </mesh>

                 <group rotation={[0, Math.PI/2, 0]}>
                    <mesh position={[R_outer, 0, 0]} rotation={[0, 0, Math.PI/2]} material={materials.brass}>
                        <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
                    </mesh>
                    <mesh position={[-R_outer, 0, 0]} rotation={[0, 0, Math.PI/2]} material={materials.brass}>
                        <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
                    </mesh>
                 </group>

                 {/* --- INNER GIMBAL (Tilt) --- */}
                 {/* NOTE: Trail is attached here, NOT to the rotor, so it doesn't spin wildly */}
                 <group ref={innerRef}>
                    <mesh rotation={[Math.PI/2, 0, 0]} castShadow material={materials.silver}>
                        <torusGeometry args={[R_inner, TUBE_THICKNESS, 32, 100]} />
                    </mesh>

                    {/* Pins */}
                    <mesh position={[0, 0, R_inner + 0.01]} rotation={[Math.PI/2, 0, 0]} material={materials.silver}>
                       <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
                    </mesh>
                    <mesh position={[0, 0, -(R_inner + 0.01)]} rotation={[Math.PI/2, 0, 0]} material={materials.silver}>
                       <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
                    </mesh>

                    {/* --- PRECESSION TRAIL --- */}
                    {/* Fixed: Moved outside Rotor. Width reduced. Length capped. */}
                    {params.showTrail && (
                         <group position={[0, 0, R_inner + 0.2]}> 
                            <Trail 
                                width={0.1}        // Much thinner line
                                length={80}        // Shorter history (approx 2-3 circles depending on speed)
                                decay={2}          // Fades out tail
                                color="#fbbf24" 
                                attenuation={(t) => t} // Smooth fade
                            >
                                <mesh visible={false}>
                                    <sphereGeometry args={[0.001]} />
                                    <meshBasicMaterial color="yellow" />
                                </mesh>
                            </Trail>
                         </group>
                    )}
                    
                    {/* --- ROTOR GROUP (Spin) --- */}
                    <group ref={rotorRef}>
                       {/* Axle */}
                       <mesh rotation={[0, 0, Math.PI/2]} castShadow material={materials.silver}>
                          <cylinderGeometry args={[0.015, 0.015, R_inner * 2.0, 16]} />
                       </mesh>
                       
                       {/* Main Flywheel */}
                       <mesh rotation={[0, 0, Math.PI/2]} castShadow material={materials.rotor}>
                          <cylinderGeometry args={[R_rotor, R_rotor, ROTOR_THICKNESS, 64]} />
                       </mesh>
                       
                       {/* Hub */}
                       <mesh rotation={[0, 0, Math.PI/2]} material={materials.silver}>
                          <cylinderGeometry args={[0.12, 0.12, ROTOR_THICKNESS + 0.02, 32]} />
                       </mesh>

                       {/* Visual Markers */}
                       {Array.from({ length: 6 }).map((_, i) => {
                          const angle = (i / 6) * Math.PI * 2;
                          const y = Math.cos(angle) * (R_rotor * 0.75);
                          const z = Math.sin(angle) * (R_rotor * 0.75);
                          const xOffset = ROTOR_THICKNESS / 2 + 0.002; 

                          return (
                            <group key={i}>
                              <mesh position={[xOffset, y, z]} rotation={[0, 0, Math.PI/2]} material={materials.marker}>
                                <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
                              </mesh>
                              <mesh position={[-xOffset, y, z]} rotation={[0, 0, Math.PI/2]} material={materials.marker}>
                                <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
                              </mesh>
                            </group>
                          );
                       })}
                    </group> {/* End Rotor */}

                 </group> {/* End Inner Gimbal */}

             </group> {/* End Outer Gimbal */}

        </group> {/* End Frame Ring */}
      </group> {/* End Base */}

      {params.showVectors && <LiveVectors targetRef={rotorRef} />}
    </>
  );
}

// Vector Visualization
// Fixed: Lengths drastically reduced to match model scale
function LiveVectors({ targetRef }) {
  const LRef = React.useRef();
  
  useFrame(() => {
    if (!targetRef.current || !LRef.current) return;
    
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    targetRef.current.getWorldPosition(worldPos);
    targetRef.current.getWorldQuaternion(worldQuat);

    LRef.current.position.copy(worldPos);
    LRef.current.quaternion.copy(worldQuat);
    LRef.current.rotateZ(-Math.PI / 2);
  });

  return (
    <group ref={LRef}>
        {/* Scaled down L vector */}
        <VectorArrow color="#3b82f6" length={0.7} label="L" />
        
        {/* Scaled down Torque vector */}
        <group rotation={[0, 0, -Math.PI/2]}>
            <VectorArrow color="#ef4444" length={0.5} label="τ" />
        </group>
    </group>
  );
}

function VectorArrow({ color, length, label }) {
  return (
    <group>
        {/* Shaft */}
        <mesh position={[0, length / 2, 0]}>
            <cylinderGeometry args={[0.008, 0.008, length, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
        {/* Tip */}
        <mesh position={[0, length, 0]}>
            <coneGeometry args={[0.025, 0.08, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
        {/* Label - closer to tip */}
        <Html position={[0, length + 0.05, 0]} center>
            <div className="px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white whitespace-nowrap backdrop-blur-sm">
                {label}
            </div>
        </Html>
    </group>
  )
}