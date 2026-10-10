import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Chip, Stack, Typography, Slider, FormControlLabel, Switch, ToggleButton, ToggleButtonGroup, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SimulationStandardWorkspace from '@/components/simulation-ui/SimulationStandardWorkspace';
import SimulationCanvas2DViewport from '@/components/simulation-ui/SimulationCanvas2DViewport';
import InstrumentHUD from './InstrumentHUD';
import SimulationPanel from '@/components/simulation-ui/SimulationPanel';
import SimulationButton from '@/components/simulation-ui/SimulationButton';
import AgentCanvasRecorder from '@/components/shared/video/AgentCanvasRecorder';
import { useAgentSimulationTools } from '@/webmcp/useAgentSimulationTools';
import { readEmbeddedMcpParameters } from '@/platform/agent/readEmbeddedMcpParameters';
import { instrumentId, instrumentParameters, defaultInstrumentParameters, configureInstrument, sampleInstrument, focusInstrument, focusCurve } from './instrumentModel';
import { drawInstrument } from './drawInstrument';

const mm = value => value === null ? '—' : `${(Math.abs(value) < 0.000005 ? 0 : value * 1000).toFixed(2)} mm`;
export default function MicroscopeTelescope() {
  const initial = useMemo(() => {
    const embedded = readEmbeddedMcpParameters(instrumentId, defaultInstrumentParameters);
    return configureInstrument(defaultInstrumentParameters, Object.fromEntries(embedded.providedKeys.map(key => [key, embedded.values[key]])));
  }, []);
  const [params, setParams] = useState(initial);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const live = useRef({ params: initial, state: sampleInstrument(initial), running: false, animationTime: 0 });
  const viewport = useRef(null), recorder = useRef(null), drag = useRef(null);
  const snapshot = useMemo(() => sampleInstrument(params), [params]);
  const graph = useMemo(() => focusCurve(params), [params]);
  const configure = useCallback(patch => {
    const next = configureInstrument(live.current.params, patch);
    const state = sampleInstrument(next);
    live.current.params = next; live.current.state = state; setParams(next); setError('');
    return { parameters: { ...next }, optics: state };
  }, []);
  const playback = useCallback(({ running: value }) => {
    if (typeof value !== 'boolean') throw new TypeError('running must be boolean');
    live.current.running = value; setRunning(value); return { running: value };
  }, []);
  const reset = useCallback(() => { playback({ running: false }); live.current.animationTime = 0; return configure({ ...defaultInstrumentParameters }); }, [configure, playback]);
  const getState = useCallback(() => JSON.parse(JSON.stringify({ simulationId: instrumentId, parameters: live.current.params, optics: live.current.state, running: live.current.running, animationTime: live.current.animationTime, model: 'Esbiko Physics: steady-state paraxial optics; animation time is illustrative' })), []);
  const actions = { getState, configure, setPlayback: playback, reset,
    startVideo: input => recorder.current.startVideo(input), stopVideo: () => recorder.current.stopVideo(),
    getVideoStatus: () => recorder.current.getVideoStatus(), downloadVideo: () => recorder.current.downloadVideo() };
  const status = useAgentSimulationTools({ simulationId: instrumentId, prefix: 'optical_instruments', properties: instrumentParameters, actions });
  const api = useRef(actions); api.current = actions;
  useEffect(() => {
    const sdk = Object.freeze(Object.fromEntries(Object.keys(api.current).map(key => [key, (...args) => api.current[key](...args)])));
    window.esbikoOpticalInstruments = sdk;
    return () => { if (window.esbikoOpticalInstruments === sdk) delete window.esbikoOpticalInstruments; };
  }, []);
  useEffect(() => { if (!running) viewport.current?.resize(); }, [params, running]);
  const draw = useCallback((ctx, view) => drawInstrument(ctx, view, live.current.params, live.current.state, live.current.animationTime), []);
  const step = useCallback(dt => { live.current.animationTime += dt; }, []);
  const micro = params.mode === 'microscope';
  const numeric = (key, label, min, max, stepSize = 1) => <Box key={key}>
    <Typography sx={{ fontSize: 12, color: '#cbd5e1' }}>{label} <strong>{params[key].toFixed(key === 'objectDistance' || key === 'apertureRadius' ? 2 : 1)}</strong></Typography>
    <Slider aria-label={label} min={Math.min(min, params[key])} max={Math.max(max, params[key])} step={stepSize} value={params[key]} onChange={(_, value) => configure({ [key]: value })} />
  </Box>;
  const controls = <Stack spacing={1}>
    <SimulationPanel title="Explore" compact><Stack spacing={1.5} sx={{ py: 1 }}>
      <Stack direction="row" spacing={1}><SimulationButton onClick={() => playback({ running: !running })}>{running ? 'Pause rays' : 'Run rays'}</SimulationButton><SimulationButton simulationVariant="subtle" onClick={reset}>Reset</SimulationButton></Stack>
      <Typography sx={{ color: '#94a3b8', fontSize: 11 }}>Animate ray direction; settings update the optics instantly.</Typography>
      <ToggleButtonGroup exclusive fullWidth size="small" value={params.mode} onChange={(_, mode) => mode && configure({ mode })} aria-label="Optical instrument" sx={{ '& button': { color: '#94a3b8', textTransform: 'none', fontSize: 11 }, '& button.Mui-selected': { color: '#67e8f9', bgcolor: '#13303d' } }}>
        <ToggleButton value="microscope">Microscope</ToggleButton><ToggleButton value="refractor">Refractor</ToggleButton><ToggleButton value="reflector">Reflector</ToggleButton>
      </ToggleButtonGroup>
    </Stack></SimulationPanel>
    <SimulationPanel title="Optical system" compact><Stack spacing={0.5} sx={{ py: 1 }}>
      {numeric('objectiveFocal', micro ? 'Objective focal length · mm' : 'Primary focal length · mm', micro ? 5 : 100, micro ? 20 : 800, 0.5)}
      {numeric('eyepieceFocal', 'Eyepiece focal length · mm', 5, 80, 0.5)}
      {micro && numeric('objectDistance', 'Object distance · mm', 5, 40, 0.05)}
      {numeric('separation', params.mode === 'reflector' ? 'Unfolded optical path · mm' : 'Lens separation · mm', 10, micro ? 400 : 1000, 0.1)}
      <SimulationButton onClick={() => { try { configure(focusInstrument(live.current.params)); } catch (e) { setError(e.message); } }}>Focus for relaxed eye</SimulationButton>
      <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Target path: {mm(snapshot.idealSeparation)}. Change focal lengths to change magnification, then refocus.</Typography>
      {error && <Alert severity="warning">{error}</Alert>}
      {snapshot.intermediateImageKind !== 'real' && <Alert severity="info">For a compound microscope, move the object beyond the objective focal point to form a real intermediate image.</Alert>}
      {!snapshot.paraxialValid && <Alert severity="warning">Large ray angles exceed this paraxial model. Reduce ray-fan radius or use a focused preset.</Alert>}
      {!micro && numeric('fieldAngle', 'Source field angle · degrees', -1, 1, 0.05)}
      {numeric('apertureRadius', 'Sampled ray-fan radius · mm', 0.05, micro ? 1 : 20, 0.05)}
    </Stack></SimulationPanel>
    <SimulationPanel title="Focus & magnification" compact><Stack spacing={1} sx={{ py: 1 }}>
      <Chip size="small" label={snapshot.focused ? 'Focused at infinity · relaxed eye' : 'Adjust focus · eye accommodation excluded'} color={snapshot.focused ? 'success' : 'default'} />
      <Typography sx={{ fontSize: 12 }}>Angular magnification: {snapshot.angularMagnification === null ? '— (refocus first)' : `${snapshot.angularMagnification.toFixed(1)}×`}</Typography>
      <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Intermediate image: {mm(snapshot.intermediateImageDistance)} · {snapshot.intermediateImageKind}<br />Final image: {snapshot.finalImageKind === 'infinity' ? '∞' : mm(snapshot.finalImageDistance)} · {snapshot.finalImageKind}<br />Exit angular spread: {(snapshot.exitAngularSpread * 1000).toFixed(3)} mrad</Typography>
      <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Negative magnification means inverted in the unfolded optical plane. Microscope reference: unaided eye at 250 mm.</Typography>
      <Typography sx={{ fontSize: 12 }}>Focus scan · exit spread vs optical path</Typography>
      <Box sx={{ height: 150 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={graph} margin={{ right: 10, bottom: 15 }}><XAxis dataKey="separation" type="number" domain={['dataMin','dataMax']} tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Optical path (mm)', position: 'bottom', fill: '#94a3b8', fontSize: 10 }} /><YAxis width={42} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip formatter={v => [+Number(v).toFixed(3), 'Spread (mrad)']} /><ReferenceLine x={params.separation} stroke="#fbbf24" /><Line dataKey="spread" stroke="#22d3ee" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></Box>
    </Stack></SimulationPanel>
    <SimulationPanel title="View & camera" compact><Stack sx={{ py: 1 }}>
      <FormControlLabel control={<Switch checked={params.showRays} onChange={(_, showRays) => configure({ showRays })} />} label="Ray paths" />
      {numeric('zoom', 'Camera zoom', 0.5, 3, 0.1)}
      <SimulationButton simulationVariant="subtle" onClick={() => configure({ zoom: 1, panX: 0, panY: 0 })}>Fit camera</SimulationButton>
      <Typography sx={{ mt: 1, fontSize: 11, color: '#94a3b8' }}>Drag the bench to pan. Vertical scale is expanded. Thin lenses / ideal mirrors, monochromatic paraxial rays. No diffraction, aberrations, clipping or secondary obstruction. The circular image is an illustrative focus preview.</Typography>
    </Stack></SimulationPanel>
    <SimulationPanel title="Video capture" compact><AgentCanvasRecorder ref={recorder} canvasSelector="#optical-instruments-canvas" filePrefix="esbiko-optical-instruments" /><Typography sx={{ fontSize: 11, color: '#94a3b8', py: 1 }}>Canvas-only silent WebM. Portrait capture crops the center; use camera controls to frame the subject.</Typography></SimulationPanel>
    <SimulationPanel title="API & agent connection" compact><Box sx={{ py: 1 }}><Chip size="small" label={`WebMCP: ${status}`} /><Typography sx={{ mt: 1, fontSize: 11, color: '#94a3b8' }}>The local JavaScript API and WebMCP share these controls. ChatGPT MCP opens this same lab with validated parameters.</Typography></Box></SimulationPanel>
  </Stack>;
  return <SimulationStandardWorkspace sx={{ '& h2': { pl: 5 } }} domain="physics" unifiedPanel title="Microscope & Telescope Lab" subtitle="Compound optics · Esbiko Physics · 2D ray laboratory" controls={controls} hudPlacement="top-right" hudPointerEvents="none"
    hud={<InstrumentHUD params={params} optics={snapshot} onVisibleChange={hudVisible => configure({ hudVisible })} />}
    viewport={<SimulationCanvas2DViewport ref={viewport} canvasId="optical-instruments-canvas" draw={draw} step={step} running={running}
      onPointerDown={(point, event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { point, params: { ...live.current.params } }; }}
      onPointerMove={point => { if (!drag.current) return; const d = drag.current; configure({ panX: Math.max(-1, Math.min(1, d.params.panX + (point.x-d.point.x)/point.width)), panY: Math.max(-1, Math.min(1, d.params.panY + (point.y-d.point.y)/point.height)) }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />} />;
}
