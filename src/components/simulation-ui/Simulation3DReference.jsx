import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Chip, FormControlLabel, MenuItem, Select, Slider, Stack, Switch, Typography, useMediaQuery } from '@mui/material';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { LineChart, Line as ChartLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SimulationStandardWorkspace from './SimulationStandardWorkspace';
import SimulationThreeViewport from './SimulationThreeViewport';
import SimulationTransparentHUD from './SimulationTransparentHUD';
import SimulationPanel from './SimulationPanel';
import SimulationButton from './SimulationButton';
import AgentCanvasRecorder from '@/components/shared/video/AgentCanvasRecorder';
import { useAgentSimulationTools } from '@/webmcp/useAgentSimulationTools';
import { advanceStandard3d, defaultStandard3dParameters, orbitReferencePoints, referenceCameraPosition, sampleStandard3d, standard3dParameters } from './standard3dModel';

const REFERENCE_CAMERA = { position: [12, 9, 14], fov: 45, near: 0.1, far: 200 };
const REFERENCE_CONTROLS = { minDistance: 3, maxDistance: 60 };

function ReferenceScene({ live, params, snapshot, cameraRevision, step, lowQuality }) {
  const body = useRef(null);
  const { camera, controls, invalidate } = useThree();
  const points = useMemo(() => orbitReferencePoints({ radius: params.radius, inclination: params.inclination }, lowQuality ? 64 : 128), [params.radius, params.inclination, lowQuality]);
  const updateBody = useCallback(() => {
    const s = live.current.state;
    body.current?.position.set(s.x, s.y, s.z);
  }, [live]);
  useEffect(() => { updateBody(); invalidate(); }, [snapshot, params, updateBody, invalidate]);
  useEffect(() => {
    camera.position.set(...referenceCameraPosition(params.cameraView, params.cameraDistance));
    camera.up.set(0, 1, 0);
    controls?.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    controls?.update(); invalidate();
  }, [camera, controls, params.cameraView, params.cameraDistance, cameraRevision, invalidate]);
  useFrame((state, dt) => {
    if (live.current.running) step(dt);
    updateBody();
    live.current.camera = { position: state.camera.position.toArray(), target: state.controls?.target.toArray() || [0, 0, 0] };
  });
  const segments = lowQuality ? 24 : 48;
  return <>
    <color attach="background" args={['#030308']} />
    <ambientLight intensity={0.7} />
    <directionalLight position={[8, 10, 5]} intensity={2.5} />
    <pointLight position={[-5, 2, -3]} intensity={12} color="#60a5fa" />
    {params.grid && <gridHelper args={[24, 24, '#233b59', '#101e31']} />}
    {params.orbits && <Line points={points} color="#38bdf8" lineWidth={1.5} transparent opacity={0.65} />}
    <mesh><sphereGeometry args={[0.85, segments, segments]} /><meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.25} roughness={0.35} /></mesh>
    <mesh ref={body}><sphereGeometry args={[0.32, segments, segments]} /><meshStandardMaterial color="#38bdf8" roughness={0.25} metalness={0.15} /></mesh>
  </>;
}

// Internal reference scene; excluded from public scientific catalog and remote MCP discovery.
export default function Simulation3DReference({ title = '3D Simulation Standard', simulationId = 'admin.standard.3d' }) {
  const lowQuality = useMediaQuery('(max-width: 600px)');
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState({ ...defaultStandard3dParameters });
  const [snapshot, setSnapshot] = useState(() => sampleStandard3d(0));
  const [samples, setSamples] = useState([]);
  const [cameraRevision, setCameraRevision] = useState(0);
  const [graphicsError, setGraphicsError] = useState('');
  const live = useRef({ running: false, params: { ...defaultStandard3dParameters }, state: sampleStandard3d(0), camera: null });
  const history = useRef([]);
  const sampleClock = useRef(0);
  const video = useRef(null);
  const canvasId = 'standard-3d-reference-canvas';
  const publish = useCallback(() => {
    setSnapshot({ ...live.current.state });
    history.current = [...history.current.slice(-199), { ...live.current.state }];
    setSamples(history.current);
  }, []);
  const configure = useCallback((patch) => {
    live.current.params = { ...live.current.params, ...patch };
    live.current.state = sampleStandard3d(live.current.state.time, live.current.params);
    if ('cameraView' in patch || 'cameraDistance' in patch) setCameraRevision(v => v + 1);
    setParams(live.current.params); setSnapshot({ ...live.current.state });
    return live.current.params;
  }, []);
  const playback = useCallback(({ running: value }) => {
    if (typeof value !== 'boolean') throw new Error('running must be boolean');
    live.current.running = value; setRunning(value); return { running: value };
  }, []);
  const reset = useCallback(() => {
    playback({ running: false });
    live.current.state = sampleStandard3d(0);
    history.current = []; sampleClock.current = 0; setSamples([]);
    configure({ ...defaultStandard3dParameters });
    return { ...live.current.state, running: false };
  }, [configure, playback]);
  const step = useCallback((dt) => {
    live.current.state = advanceStandard3d(live.current.state, dt, live.current.params);
    sampleClock.current += Math.min(dt, 0.05);
    if (sampleClock.current >= 0.1) { sampleClock.current %= 0.1; publish(); }
  }, [publish]);
  const status = useAgentSimulationTools({ simulationId, prefix: 'standard3d', properties: standard3dParameters,
    actions: { getState: () => ({ ...live.current.state, running: live.current.running, parameters: live.current.params, camera: live.current.camera, model: 'reference kinematics; gravity not modeled' }),
      configure, setPlayback: playback, reset,
      startVideo: input => video.current.startVideo(input), stopVideo: () => video.current.stopVideo(), getVideoStatus: () => video.current.getVideoStatus(), downloadVideo: () => video.current.downloadVideo() } });
  const panel = <Stack spacing={1}>
    <SimulationPanel title="Playback" compact><Stack direction="row" spacing={1}>
      <SimulationButton onClick={() => playback({ running: !live.current.running })} disabled={Boolean(graphicsError)}>{running ? 'Pause' : 'Run'}</SimulationButton>
      <SimulationButton simulationVariant="subtle" onClick={reset}>Reset</SimulationButton>
      <SimulationButton simulationVariant="subtle" disabled={running} onClick={() => { step(0.05); publish(); }}>Step</SimulationButton>
    </Stack></SimulationPanel>
    <SimulationPanel title="Model parameters" compact><Stack spacing={1}>
      <Typography>Speed · {params.speed.toFixed(1)}×</Typography><Slider aria-label="Simulation speed" min={0.1} max={4} step={0.1} value={params.speed} onChange={(_, speed) => configure({ speed })} />
      <Typography>Reference radius · {params.radius.toFixed(1)} m</Typography><Slider aria-label="Reference radius" min={2} max={8} step={0.1} value={params.radius} onChange={(_, radius) => configure({ radius })} />
      <Typography>Inclination · {params.inclination}°</Typography><Slider aria-label="Orbit inclination" min={0} max={75} step={1} value={params.inclination} onChange={(_, inclination) => configure({ inclination })} />
    </Stack></SimulationPanel>
    <SimulationPanel title="Camera & display" compact><Stack spacing={1}>
      <Select size="small" value={params.cameraView} inputProps={{ 'aria-label': 'Camera view' }} onChange={event => configure({ cameraView: event.target.value })}>
        <MenuItem value="oblique">Oblique view</MenuItem><MenuItem value="top">Top view</MenuItem><MenuItem value="front">Front view</MenuItem>
      </Select>
      <Typography>Camera distance · {params.cameraDistance.toFixed(1)} m</Typography><Slider aria-label="Camera distance" min={10} max={40} step={0.5} value={params.cameraDistance} onChange={(_, cameraDistance) => configure({ cameraDistance })} />
      <SimulationButton simulationVariant="subtle" onClick={() => configure({ cameraView: 'oblique', cameraDistance: Math.max(10, params.radius * 3.5) })}>Fit camera</SimulationButton>
      <Typography sx={{ color: '#94a3b8', fontSize: 12 }}>Drag to rotate · wheel/pinch to zoom · right drag/two fingers to pan. Keyboard users can choose views and distance.</Typography>
      {['grid', 'orbits', 'hudVisible'].map(key => <FormControlLabel key={key} control={<Switch checked={params[key]} onChange={(_, value) => configure({ [key]: value })} />} label={{ grid: 'Coordinate grid', orbits: 'Reference orbit', hudVisible: 'Show HUD' }[key]} />)}
    </Stack></SimulationPanel>
    <SimulationPanel title="Measurements & graph" compact><Typography sx={{ fontSize: 13 }}>Position over time · metres / seconds</Typography>
      <Box sx={{ height: 160 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={samples}><XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis width={32} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip /><ChartLine dataKey="x" stroke="#38bdf8" dot={false} isAnimationActive={false} /><ChartLine dataKey="z" stroke="#fbbf24" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></Box>
    </SimulationPanel>
    <SimulationPanel title="Agent connection" compact><Chip size="small" label={'WebMCP: ' + status} /><Typography sx={{ mt: 1, fontSize: 12, color: '#94a3b8' }}>Live scene and controls share one state. The reference model is kinematic; it does not solve gravity.</Typography></SimulationPanel>
    <SimulationPanel title="Video capture" compact><AgentCanvasRecorder ref={video} canvasSelector={'#' + canvasId} filePrefix="esbiko-standard-3d" /><Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Silent WebM · 16:9 / 9:16 · canvas only</Typography></SimulationPanel>
    {graphicsError && <Alert severity="error">{graphicsError}</Alert>}
  </Stack>;
  return <SimulationStandardWorkspace hudPointerEvents="none" unifiedPanel simulationType="3d" title={title} subtitle="Orbit Lab inspired reference · drag to explore the 3D scene" controls={panel}
    hud={<SimulationTransparentHUD visible={params.hudVisible} onVisibleChange={hudVisible => configure({ hudVisible })} rows={[
      { label: 'Time', value: snapshot.time.toFixed(2) + ' s' },
      { label: 'Position', value: [snapshot.x, snapshot.y, snapshot.z].map(v => v.toFixed(2)).join(', ') + ' m' },
      { label: 'Radius', value: snapshot.radius.toFixed(1) + ' m' },
      { label: 'Playback', value: running ? 'Running' : 'Paused' },
    ]} />}
    viewport={<SimulationThreeViewport quality={lowQuality ? 'low' : 'balanced'} frameloop={running ? 'always' : 'demand'} shadows={false} preserveDrawingBuffer showDefaultLights={false}
      camera={REFERENCE_CAMERA} controls={REFERENCE_CONTROLS}
      onCreated={state => { state.gl.domElement.id = canvasId; state.gl.domElement.setAttribute('aria-label', '3D reference simulation canvas'); }}
      onContextLost={() => { playback({ running: false }); setGraphicsError('Graphics context lost. Playback paused; reload if your browser cannot restore it.'); }}
      onContextRestored={() => { setGraphicsError(''); setCameraRevision(v => v + 1); }}>
      <ReferenceScene live={live} params={params} snapshot={snapshot} cameraRevision={cameraRevision} step={step} lowQuality={lowQuality} />
    </SimulationThreeViewport>} />;
}
