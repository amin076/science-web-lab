import React, { useState, useRef, useMemo, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Sphere } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/* =========================================
   1. MICROSCOPE CONTEXT
   ========================================= */
const MicroscopeContext = createContext(null);

/* =========================================
   2. BIOLOGICAL SIMULATION (Plant Cells)
   ========================================= */

// A single Chloroplast (the green energy organelle)
const Chloroplast = ({ parentSize, offset }) => {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Simulate Cytoplasmic Streaming (Cyclosis)
    // Chloroplasts travel in a loop around the cell edge
    const speed = 0.5;
    const pathRadiusX = parentSize[0] / 2 - 0.2;
    const pathRadiusY = parentSize[1] / 2 - 0.2;
    
    // Move in an ellipse
    ref.current.position.x = Math.cos(t * speed + offset) * pathRadiusX;
    ref.current.position.y = Math.sin(t * speed + offset) * pathRadiusY;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#4ade80" roughness={0.8} />
    </mesh>
  );
};

// A Single Plant Cell
const PlantCell = ({ position }) => {
  const { focus } = useContext(MicroscopeContext);
  const wallRef = useRef();
  const interiorRef = useRef();
  
  // Cell Dimensions (Elodea cells are rectangular)
  const width = 1.8;
  const height = 1.2;
  const depth = 0.5;

  // Generate 12-15 Chloroplasts per cell
  const chloroplasts = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      offset: i * (Math.PI * 2 / 14) // Distribute evenly along the path
    }));
  }, []);

  useFrame(() => {
    /* --- MANUAL FOCUS LOGIC --- */
    // Map Knob (0..1) to Z-Depth (-1..1)
    const focusPlaneZ = (focus * 3) - 1.5;
    const myZ = position[2];

    // 1. CELL WALL VISIBILITY
    // The wall is visible when focus is slightly above the center (surface view)
    const distToWall = Math.abs((myZ + 0.2) - focusPlaneZ);
    const wallOpacity = Math.max(0.05, 1 - (distToWall * 1.5));
    
    // 2. INTERIOR VISIBILITY (Chloroplasts)
    // The interior is visible when focus is exactly at Z center
    const distToInterior = Math.abs(myZ - focusPlaneZ);
    const interiorOpacity = Math.max(0, 1 - (distToInterior * 2));

    if (wallRef.current) {
       wallRef.current.opacity = THREE.MathUtils.lerp(wallRef.current.opacity, wallOpacity, 0.1);
       // Blur effect: scale down lines when out of focus
       wallRef.current.transparent = true;
    }
    
    if (interiorRef.current) {
        // Hide organelles if out of focus
        interiorRef.current.visible = interiorOpacity > 0.1;
    }
  });

  return (
    <group position={position}>
      {/* CELL WALL (The Grid Structure) */}
      <mesh ref={wallRef}>
        <boxGeometry args={[width - 0.1, height - 0.1, depth]} />
        {/* Semi-transparent rigid cell wall */}
        <meshPhysicalMaterial 
          color="#14532d" // Dark Green
          wireframe={false}
          transmission={0.2}
          thickness={1}
          roughness={0.1}
          clearcoat={1}
          transparent
          opacity={0.3}
        />
        {/* Wireframe overlay for sharp cell definitions */}
        <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(width-0.1, height-0.1, depth)]} />
            <lineBasicMaterial color="#4ade80" transparent opacity={0.3} />
        </lineSegments>
      </mesh>

      {/* CELL INTERIOR (Cytoplasm & Chloroplasts) */}
      <group ref={interiorRef}>
         {chloroplasts.map((c, i) => (
           <Chloroplast key={i} parentSize={[width, height]} offset={c.offset} />
         ))}
      </group>
    </group>
  );
};

// The Leaf Tissue (Grid of Cells)
const LeafSample = () => {
  const cells = useMemo(() => {
    const grid = [];
    // Create a 5x5 grid of cells
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        grid.push({
          position: [
            x * 1.8, 
            y * 1.2, 
            (Math.random() * 0.2) // Slight Z variation (real leaves aren't perfectly flat)
          ]
        });
      }
    }
    return grid;
  }, []);

  return (
    <group>
      {/* Backlight / Glass Slide */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#dcfce7" transparent opacity={0.1} />
      </mesh>
      
      {cells.map((cell, i) => (
        <PlantCell key={i} position={cell.position} />
      ))}
    </group>
  );
};

/* =========================================
   3. SCENE SETUP
   ========================================= */
const MicroscopeScene = () => {
  const { zoom, light } = useContext(MicroscopeContext);
  const { camera } = useThree();

  useFrame(() => {
    // Zoom Logic
    const targetZ = 8 - (zoom * 0.6); 
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
  });

  return (
    <>
      {/* Light mimics a microscope backlight */}
      <ambientLight intensity={0.4 * light} />
      <directionalLight position={[0, 0, 10]} intensity={1.5 * light} color="#fff" />
      <pointLight position={[0, 10, 5]} intensity={0.5} />

      <LeafSample />
      
      {/* Green fog to simulate looking through tissue */}
      <fog attach="fog" args={['#000', 5, 18]} />
    </>
  );
};

/* =========================================
   4. UI COMPONENTS (Knob)
   ========================================= */
const Knob = ({ label, value, min, max, onChange }) => {
  const angle = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 15px' }}>
      <div 
        style={{ 
          width: '70px', height: '70px', borderRadius: '50%', 
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: '5px 5px 10px #0b0b0b, -5px -5px 10px #353535',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'ns-resize'
        }}
      >
        <motion.div
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            border: '4px solid #444', position: 'relative', rotate: angle 
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(event, info) => {
            const delta = -info.delta.y * 0.005 * (max - min);
            onChange(Math.min(max, Math.max(min, value + delta)));
          }}
        >
          <div style={{ 
            position: 'absolute', top: '10%', left: '50%', 
            width: '4px', height: '15px', background: '#4ade80', // Green indicator
            transform: 'translateX(-50%)', borderRadius: '2px'
          }} />
        </motion.div>
      </div>
      <span style={{ color: '#aaa', marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        {label.toUpperCase()}
      </span>
    </div>
  );
};

/* =========================================
   5. MAIN COMPONENT
   ========================================= */
export default function MicroscopeSimulation() {
  const [focus, setFocus] = useState(0.5); 
  const [zoom, setZoom] = useState(1);    
  const [light, setLight] = useState(1);   

  return (
    <MicroscopeContext.Provider value={{ focus, zoom, light }}>
      <div style={{ 
        width: '100%', height: '100%', background: '#020617', // Very dark blue/black
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Title */}
        <div style={{ position: 'absolute', top: 20, left: 30, color: 'white', fontFamily: 'sans-serif' }}>
          <h2 style={{ margin: 0, fontWeight: 300, fontSize: '1.5rem', color: '#64748b' }}>BIOLOGY LAB</h2>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', letterSpacing: '1px', color: '#4ade80' }}>ELODEA LEAF</h1>
        </div>

        {/* Eyepiece */}
        <div style={{
          width: 'min(500px, 80vw)', height: 'min(500px, 80vw)',
          borderRadius: '50%',
          border: '20px solid #1a1a1a',
          boxShadow: '0 0 50px rgba(0,0,0,0.9), inset 0 0 60px rgba(0,0,0,0.9)',
          overflow: 'hidden',
          position: 'relative',
          background: '#051e11', // Deep green-black background
          marginBottom: '20px'
        }}>
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <MicroscopeScene />
          </Canvas>

          {/* Scale Overlay */}
          <div style={{
            position: 'absolute', bottom: '20%', right: '20%', 
            color: 'white', fontSize: '12px', fontFamily: 'monospace', opacity: 0.7,
            pointerEvents: 'none'
          }}>
            <div style={{ width: '100px', height: '2px', background: 'white', marginBottom: '5px' }}></div>
            <div>50 µm</div>
          </div>
          
          {/* Subtle Dust/Noise Texture (CSS) */}
          <div style={{
              position: 'absolute', top:0, left:0, width:'100%', height:'100%',
              backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+")',
              pointerEvents: 'none', opacity: 0.3
          }} />
        </div>

        {/* Info Box */}
        <div style={{ 
          display: 'flex', gap: '30px', marginBottom: '30px', 
          color: '#4ade80', fontFamily: 'monospace', fontSize: '14px',
          background: 'rgba(20, 83, 45, 0.3)', padding: '10px 20px', borderRadius: '8px', border: '1px solid #14532d'
        }}>
          <div>DEPTH: Z={(focus * 10 - 5).toFixed(1)} µm</div>
          <div>MAGNIFICATION: {Math.round(zoom * 100)}x</div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', background: '#1a1a1a', padding: '20px 40px', 
          borderRadius: '20px', borderTop: '2px solid #333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <Knob label="Focus" value={focus} min={0} max={1} onChange={setFocus} />
          <Knob label="Zoom" value={zoom} min={1} max={10} onChange={setZoom} />
          <Knob label="Light" value={light} min={0.2} max={2} onChange={setLight} />
        </div>

      </div>
    </MicroscopeContext.Provider>
  );
}