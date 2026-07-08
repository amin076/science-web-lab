import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CAMERA_MOTION_PRESETS,
  IMAGE_MOTION_FORMATS,
  LIGHT_PRESETS,
  OBJECT_MOTION_PRESETS,
  PARTICLE_PRESETS,
  SCENE_MODES,
} from "./imageMotionPresets";

const TAU = Math.PI * 2;
const MAX_PARTICLES = 780;
const STAR_COUNT = 620;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function getSceneSize(format) {
  const output = IMAGE_MOTION_FORMATS[format] || IMAGE_MOTION_FORMATS.shorts;
  if (output.aspect > 1.2) return { width: 8.8, height: 4.95 };
  if (output.aspect < 0.8) return { width: 4.65, height: 8.25 };
  return { width: 6.6, height: 6.6 };
}

function hexToColorArray(hex) {
  const color = new THREE.Color(hex || "#ffffff");
  return [color.r, color.g, color.b];
}

function buildTimeline(slides) {
  const durations = slides.map((slide) => Math.max(0.25, slide.duration || 4));
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  return { durations, total };
}

function resolveTimeline(slides, durations, totalDuration, elapsed) {
  if (!slides.length || totalDuration <= 0) {
    return { slide: null, index: 0, progress: 0, localTime: 0, time: 0 };
  }

  const localTime = elapsed % totalDuration;
  let cursor = 0;
  let index = 0;

  for (let i = 0; i < durations.length; i += 1) {
    if (localTime < cursor + durations[i]) {
      index = i;
      break;
    }
    cursor += durations[i];
  }

  const duration = durations[index] || 1;
  const progress = clamp((localTime - cursor) / duration, 0, 1);

  return {
    slide: slides[index],
    index,
    progress,
    localTime,
    time: elapsed,
  };
}

function createCoverTexture(texture, width, height) {
  const cloned = texture.clone();
  const imageWidth = texture.image?.width || 1;
  const imageHeight = texture.image?.height || 1;
  const imageRatio = imageWidth / imageHeight;
  const planeRatio = width / height;

  cloned.wrapS = THREE.ClampToEdgeWrapping;
  cloned.wrapT = THREE.ClampToEdgeWrapping;

  if (imageRatio > planeRatio) {
    cloned.repeat.set(planeRatio / imageRatio, 1);
    cloned.offset.set((1 - cloned.repeat.x) / 2, 0);
  } else {
    cloned.repeat.set(1, imageRatio / planeRatio);
    cloned.offset.set(0, (1 - cloned.repeat.y) / 2);
  }

  cloned.colorSpace = THREE.SRGBColorSpace;
  cloned.needsUpdate = true;
  return cloned;
}

function TexturePlane({
  url,
  width,
  height,
  position,
  opacity = 1,
  color = "#ffffff",
  parallax = 0,
  progress = 0,
  time = 0,
  fade = 1,
  depth = 1,
}) {
  const sourceTexture = useLoader(THREE.TextureLoader, url);
  const texture = useMemo(
    () => createCoverTexture(sourceTexture, width, height),
    [height, sourceTexture, width],
  );
  const meshRef = useRef(null);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (!meshRef.current) return;
    const wave = Math.sin(time * 0.42 + parallax) * 0.035 * depth;
    const drift = (progress - 0.5) * parallax * depth;
    meshRef.current.position.x = position[0] + drift + wave;
    meshRef.current.position.y = position[1] + drift * 0.22;
    meshRef.current.position.z = position[2];
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height, 1, 1]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity * fade}
        toneMapped={false}
      />
    </mesh>
  );
}

function ObjectLayer({ slide, sceneSize, progress, time, fade }) {
  if (!slide.objectUrl) return null;

  return (
    <ObjectTextureLayer
      slide={slide}
      sceneSize={sceneSize}
      progress={progress}
      time={time}
      fade={fade}
    />
  );
}

function ObjectTextureLayer({ slide, sceneSize, progress, time, fade }) {
  const texture = useLoader(THREE.TextureLoader, slide.objectUrl);
  const meshRef = useRef(null);
  const motion =
    OBJECT_MOTION_PRESETS[slide.objectMotion] || OBJECT_MOTION_PRESETS.float;
  const baseScale = slide.objectScale || 0.8;

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame(() => {
    if (!meshRef.current) return;
    const eased = easeInOut(progress);
    const circle = time * 0.55;
    const orbitX = Math.cos(circle) * motion.orbitRadius;
    const orbitY = Math.sin(circle * 0.83) * motion.orbitRadius * 0.58;
    const travelX = (eased - 0.5) * motion.xTravel;
    const travelY = (eased - 0.5) * motion.yTravel;
    const travelZ = (eased - 0.5) * motion.zTravel;

    meshRef.current.position.set(
      sceneSize.width * 0.18 + orbitX + travelX,
      sceneSize.height * 0.1 + orbitY + travelY,
      0.55 + travelZ,
    );
    meshRef.current.rotation.z = Math.sin(circle * 0.72) * 0.08 + time * motion.rotation;
    meshRef.current.scale.setScalar(
      baseScale * (1 + motion.scalePulse * eased + Math.sin(time * 1.2) * 0.018),
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.55]}>
      <planeGeometry args={[1.25, 1.25, 1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.96 * fade}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ParticleSystem({ settings, sceneSize, sceneMode, progress, time, fade }) {
  const pointsRef = useRef(null);
  const mode = SCENE_MODES[sceneMode] || SCENE_MODES.depthParallax;
  const config = settings || PARTICLE_PRESETS.ringDebris;
  const particleCount = clamp(Math.round(config.count || 0), 0, MAX_PARTICLES);
  const colorA = hexToColorArray(config.colorA);
  const colorB = hexToColorArray(config.colorB);

  const { positions, colors, seeds } = useMemo(() => {
    const nextPositions = new Float32Array(MAX_PARTICLES * 3);
    const nextColors = new Float32Array(MAX_PARTICLES * 3);
    const nextSeeds = new Float32Array(MAX_PARTICLES * 4);
    let seed = 123457;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let index = 0; index < MAX_PARTICLES; index += 1) {
      const i3 = index * 3;
      const i4 = index * 4;
      const sideBias = rand() - 0.5;
      nextPositions[i3] = sideBias * sceneSize.width * 1.55;
      nextPositions[i3 + 1] = (rand() - 0.5) * sceneSize.height * 1.35;
      nextPositions[i3 + 2] = 0.25 + rand() * 4.8;
      nextSeeds[i4] = rand();
      nextSeeds[i4 + 1] = rand();
      nextSeeds[i4 + 2] = rand();
      nextSeeds[i4 + 3] = rand();
      const mix = rand();
      nextColors[i3] = colorA[0] * (1 - mix) + colorB[0] * mix;
      nextColors[i3 + 1] = colorA[1] * (1 - mix) + colorB[1] * mix;
      nextColors[i3 + 2] = colorA[2] * (1 - mix) + colorB[2] * mix;
    }

    return { positions: nextPositions, colors: nextColors, seeds: nextSeeds };
  }, [colorA, colorB, sceneSize.height, sceneSize.width]);

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;
    const positionAttribute = points.geometry.getAttribute("position");
    const array = positionAttribute.array;
    const speed = (config.speed || 0) * mode.depth;
    const depth = config.depth || 1;
    const ringBias = sceneMode === "ringFlight" ? 1.55 : 1;

    for (let index = 0; index < particleCount; index += 1) {
      const i3 = index * 3;
      const i4 = index * 4;
      const seedX = seeds[i4] - 0.5;
      const seedY = seeds[i4 + 1] - 0.5;
      const seedPhase = seeds[i4 + 2] * TAU;
      const seedDepth = seeds[i4 + 3];
      const travel = progress * sceneSize.width * speed * 2.4;
      const wave = Math.sin(time * (0.7 + seedDepth) + seedPhase);
      array[i3] =
        seedX * sceneSize.width * 1.75 +
        travel * ringBias +
        Math.sin(time * 0.38 + seedPhase) * 0.2 * depth;
      array[i3 + 1] =
        seedY * sceneSize.height * 1.5 +
        wave * 0.34 * (config.randomness || 0.7);
      array[i3 + 2] = 0.2 + seedDepth * 4.2 * depth - progress * 1.6 * speed;

      if (array[i3] > sceneSize.width * 1.1) {
        array[i3] -= sceneSize.width * 2.2;
      }
    }

    positionAttribute.needsUpdate = true;
    points.rotation.z = Math.sin(time * 0.09) * 0.035 * mode.depth;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={config.size || 0.03}
        transparent
        opacity={(config.opacity || 0.5) * fade}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Starfield({ sceneSize, time }) {
  const pointsRef = useRef(null);
  const { positions, colors } = useMemo(() => {
    const nextPositions = new Float32Array(STAR_COUNT * 3);
    const nextColors = new Float32Array(STAR_COUNT * 3);
    let seed = 840331;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };

    for (let index = 0; index < STAR_COUNT; index += 1) {
      const i3 = index * 3;
      nextPositions[i3] = (rand() - 0.5) * sceneSize.width * 3.3;
      nextPositions[i3 + 1] = (rand() - 0.5) * sceneSize.height * 3.3;
      nextPositions[i3 + 2] = -9 - rand() * 4;
      const warmth = rand();
      nextColors[i3] = 0.66 + warmth * 0.28;
      nextColors[i3 + 1] = 0.76 + warmth * 0.18;
      nextColors[i3 + 2] = 1;
    }
    return { positions: nextPositions, colors: nextColors };
  }, [sceneSize.height, sceneSize.width]);

  useFrame(() => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z = time * 0.002;
    pointsRef.current.position.x = Math.sin(time * 0.035) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        transparent
        opacity={0.62}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function createGlowTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.18, `${color}cc`);
  gradient.addColorStop(0.48, `${color}40`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function LightLayer({ settings, sceneSize, progress, time, fade }) {
  const config = settings || LIGHT_PRESETS.cinematicGlow;
  const glowTexture = useMemo(
    () => createGlowTexture(config.color || "#67e8f9"),
    [config.color],
  );

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  const x = Math.sin(time * 0.28) * sceneSize.width * 0.22 + (progress - 0.5) * 0.8;
  const y = sceneSize.height * 0.16 + Math.cos(time * 0.2) * 0.38;

  return (
    <group>
      <mesh position={[x, y, 0.9]} rotation={[0, 0, time * 0.03]}>
        <planeGeometry args={[sceneSize.width * 1.15, sceneSize.width * 1.15]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={(config.glow || 0) * 0.34 * fade}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {config.rays > 0 ? (
        <mesh position={[x * 0.65, y * 0.6, 1]} rotation={[0, 0, 0.52 + time * 0.02]}>
          <planeGeometry args={[sceneSize.width * 1.9, 0.09 + config.rays * 0.15]} />
          <meshBasicMaterial
            color={config.color}
            transparent
            opacity={config.rays * 0.22 * fade}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function VignetteLayer({ settings, sceneSize }) {
  const config = settings || LIGHT_PRESETS.cinematicGlow;
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(256, 256, 110, 256, 256, 288);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.66, "rgba(0,0,0,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0, 1.35]}>
      <planeGeometry args={[sceneSize.width * 1.12, sceneSize.height * 1.12]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={config.vignette || 0.5}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function CameraAnimator({ motionKey, sceneMode, progress, time }) {
  const { camera } = useThree();
  const motion =
    CAMERA_MOTION_PRESETS[motionKey] || CAMERA_MOTION_PRESETS.slowCosmicPush;
  const mode = SCENE_MODES[sceneMode] || SCENE_MODES.depthParallax;

  useFrame(() => {
    const eased = easeInOut(progress);
    const baseZ = motion.zStart + (motion.zEnd - motion.zStart) * eased;
    const microX = Math.sin(time * 0.67) * 0.045 * mode.depth;
    const microY = Math.cos(time * 0.53) * 0.035 * mode.depth;
    let x = (eased - 0.5) * motion.xDrift + microX;
    let y = (eased - 0.5) * motion.yDrift + microY;
    let z = baseZ;

    if (motion.camera === "orbitDrift") {
      x += Math.sin(time * 0.24) * 0.34 * mode.depth;
      y += Math.cos(time * 0.2) * 0.16 * mode.depth;
    }

    if (motion.camera === "truckLeft" || motion.camera === "truckRight") {
      x += Math.sin(time * 0.12) * 0.18;
    }

    if (motion.camera === "flyThrough") {
      z -= Math.sin(eased * Math.PI) * 0.45 * mode.depth;
      x += Math.sin(time * 0.36) * 0.22;
    }

    if (motion.camera === "micro") {
      x += Math.sin(time * 1.6) * 0.08;
      y += Math.cos(time * 1.4) * 0.06;
      z += Math.sin(time * 0.9) * 0.08;
    }

    camera.position.set(x, y, z);
    camera.rotation.set(
      (eased - 0.5) * 0.035 * mode.depth,
      -(eased - 0.5) * 0.045 * mode.depth,
      motion.roll * Math.sin(eased * Math.PI) + Math.sin(time * 0.08) * 0.006,
    );
    camera.lookAt(0, 0, -1.5);
  });

  return null;
}

function EmptyScene({ sceneSize, time }) {
  return (
    <group>
      <Starfield sceneSize={sceneSize} time={time} />
      <LightLayer
        settings={LIGHT_PRESETS.cinematicGlow}
        sceneSize={sceneSize}
        progress={0.35}
        time={time}
        fade={1}
      />
      <Text
        position={[0, 0.25, 0.6]}
        fontSize={sceneSize.width * 0.06}
        maxWidth={sceneSize.width * 0.82}
        textAlign="center"
        color="#e0f2fe"
        anchorX="center"
        anchorY="middle"
      >
        Upload images to build a layered science scene
      </Text>
      <Text
        position={[0, -0.38, 0.6]}
        fontSize={sceneSize.width * 0.028}
        maxWidth={sceneSize.width * 0.72}
        textAlign="center"
        color="#93c5fd"
        anchorX="center"
        anchorY="middle"
      >
        Camera, particles, object PNGs, light, and starfield animate separately.
      </Text>
      <VignetteLayer settings={LIGHT_PRESETS.deepVignette} sceneSize={sceneSize} />
    </group>
  );
}

function SlideScene({
  slide,
  sceneSize,
  progress,
  time,
  showCaptions,
}) {
  const mode = SCENE_MODES[slide.sceneMode] || SCENE_MODES.depthParallax;
  const fadeWindow = 0.11;
  const fadeIn = clamp(progress / fadeWindow, 0, 1);
  const fadeOut = clamp((1 - progress) / fadeWindow, 0, 1);
  const fade = Math.min(1, easeInOut(fadeIn), easeInOut(fadeOut));
  const particleSettings =
    slide.particleSettings || PARTICLE_PRESETS[slide.particlePreset] || PARTICLE_PRESETS.ringDebris;
  const lightSettings =
    slide.lightSettings || LIGHT_PRESETS[slide.lightPreset] || LIGHT_PRESETS.cinematicGlow;
  const depth = mode.depth;
  const mainScale = 1.04 + Math.sin(progress * Math.PI) * 0.04 * depth;

  return (
    <group>
      <CameraAnimator
        motionKey={slide.cameraMotion}
        sceneMode={slide.sceneMode}
        progress={progress}
        time={time}
      />
      <Starfield sceneSize={sceneSize} time={time} />
      <TexturePlane
        url={slide.backgroundUrl}
        width={sceneSize.width * (1.62 + depth * 0.12)}
        height={sceneSize.height * (1.62 + depth * 0.12)}
        position={[0, 0, -5.2]}
        opacity={0.62}
        color="#8fb4ff"
        parallax={-0.18}
        progress={progress}
        time={time}
        fade={fade}
        depth={depth}
      />
      <TexturePlane
        url={slide.backgroundUrl}
        width={sceneSize.width * mainScale}
        height={sceneSize.height * mainScale}
        position={[0, 0, -1.7]}
        opacity={0.98}
        parallax={0.3}
        progress={progress}
        time={time}
        fade={fade}
        depth={depth}
      />
      <LightLayer
        settings={lightSettings}
        sceneSize={sceneSize}
        progress={progress}
        time={time}
        fade={fade}
      />
      <ObjectLayer
        slide={slide}
        sceneSize={sceneSize}
        progress={progress}
        time={time}
        fade={fade}
      />
      <ParticleSystem
        settings={particleSettings}
        sceneSize={sceneSize}
        sceneMode={slide.sceneMode}
        progress={progress}
        time={time}
        fade={fade}
      />
      {showCaptions && slide.caption ? (
        <Text
          position={[0, -sceneSize.height * 0.37, 1.15]}
          fontSize={Math.max(0.16, sceneSize.width * 0.052)}
          maxWidth={sceneSize.width * 0.82}
          textAlign="center"
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.014}
          outlineColor="#020617"
        >
          {slide.caption}
        </Text>
      ) : null}
      <VignetteLayer settings={lightSettings} sceneSize={sceneSize} />
    </group>
  );
}

function ScenePlayer({
  slides,
  format,
  isPlaying,
  showCaptions,
  restartKey,
  onTimeUpdate,
}) {
  const sceneSize = useMemo(() => getSceneSize(format), [format]);
  const timeline = useMemo(() => buildTimeline(slides), [slides]);
  const elapsedRef = useRef(0);
  const notifyRef = useRef(0);
  const [frameState, setFrameState] = useState(() =>
    resolveTimeline(slides, timeline.durations, timeline.total, 0),
  );

  useEffect(() => {
    elapsedRef.current = 0;
    setFrameState(resolveTimeline(slides, timeline.durations, timeline.total, 0));
    onTimeUpdate?.(0);
  }, [format, onTimeUpdate, restartKey, slides, timeline.durations, timeline.total]);

  useFrame((_, delta) => {
    if (isPlaying) {
      elapsedRef.current += Math.min(delta, 1 / 24);
    }

    const nextState = resolveTimeline(
      slides,
      timeline.durations,
      timeline.total,
      elapsedRef.current,
    );

    setFrameState(nextState);

    if (onTimeUpdate && elapsedRef.current - notifyRef.current > 0.16) {
      notifyRef.current = elapsedRef.current;
      onTimeUpdate(timeline.total ? nextState.localTime : 0);
    }
  });

  if (!slides.length || !frameState.slide) {
    return <EmptyScene sceneSize={sceneSize} time={elapsedRef.current} />;
  }

  return (
    <SlideScene
      slide={frameState.slide}
      sceneSize={sceneSize}
      progress={frameState.progress}
      time={frameState.time}
      showCaptions={showCaptions}
    />
  );
}

export default function ImageMotionCanvas({
  slides,
  format,
  isPlaying,
  showCaptions,
  restartKey,
  onTimeUpdate,
}) {
  const output = IMAGE_MOTION_FORMATS[format] || IMAGE_MOTION_FORMATS.shorts;

  return (
    <div id="image-motion-studio-root" className="h-full w-full">
      <Canvas
        id="image-motion-recording-canvas"
        className="image-motion-canvas block h-full w-full rounded-2xl bg-black shadow-[0_34px_120px_rgba(0,0,0,0.52)]"
        gl={{
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7.4], fov: 45, near: 0.1, far: 60 }}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: `${output.width} / ${output.height}`,
          background:
            "radial-gradient(circle at 50% 38%, #172554 0%, #020617 60%, #000 100%)",
        }}
      >
        <color attach="background" args={["#020617"]} />
        <Suspense fallback={null}>
          <ScenePlayer
            slides={slides}
            format={format}
            isPlaying={isPlaying}
            showCaptions={showCaptions}
            restartKey={restartKey}
            onTimeUpdate={onTimeUpdate}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
