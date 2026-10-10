import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Chip, Slider, Stack, Switch, FormControlLabel, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SimulationStandardWorkspace from './SimulationStandardWorkspace';
import SimulationCanvas2DViewport from './SimulationCanvas2DViewport';
import SimulationPanel from './SimulationPanel';
import SimulationButton from './SimulationButton';
import AgentCanvasRecorder from '@/components/shared/video/AgentCanvasRecorder';
import { useAgentSimulationTools } from '@/webmcp/useAgentSimulationTools';
import { advanceStandard2d, sampleStandard2d, defaultStandard2dParameters, standard2dParameters } from './standard2dModel';

// A reference adapter, deliberately outside the scientific simulation catalog.
export default function Simulation2DReference({ title = '2D Simulation Standard', simulationId = 'admin.standard.2d' }) {
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState({ ...defaultStandard2dParameters });
  const [snapshot, setSnapshot] = useState(sampleStandard2d(0));
  const [samples, setSamples] = useState([]);
  const live = useRef({ running, params, state: snapshot });
  const samplesRef = useRef([]);
  const nextSample = useRef(0);
  const viewport = useRef(null);
  const video = useRef(null);
  const drag = useRef(null);
  const canvasId = 'standard-2d-reference-canvas';
  const configure = useCallback((patch) => {
    const next = { ...live.current.params, ...patch };
    live.current.params = next;
    setParams(next);
    return next;
  }, []);
  const playback = useCallback(({ running: value }) => {
    if (typeof value !== 'boolean') throw new Error('running must be boolean');
    live.current.running = value; setRunning(value); return { running: value };
  }, []);
  const reset = useCallback(() => {
    playback({ running: false });
    live.current.state = sampleStandard2d(0);
    samplesRef.current = []; nextSample.current = 0;
    setSnapshot(live.current.state); setSamples([]);
    configure({ ...defaultStandard2dParameters });
    return { ...live.current.state, running: false };
  }, [configure, playback]);
  const status = useAgentSimulationTools({ simulationId, prefix: 'standard2d', properties: standard2dParameters,
    actions: { getState: () => ({ ...live.current.state, running: live.current.running, parameters: live.current.params, model: 'reference unit-circle; not a scientific experiment' }),
      configure, setPlayback: playback, reset,
      startVideo: (input) => video.current.startVideo(input), stopVideo: () => video.current.stopVideo(),
      getVideoStatus: () => video.current.getVideoStatus(), downloadVideo: () => video.current.downloadVideo() } });
  const step = useCallback((dt) => {
    live.current.state = advanceStandard2d(live.current.state, dt, live.current.params.speed);
    if (live.current.state.time >= nextSample.current) {
      nextSample.current = live.current.state.time + 0.1;
      samplesRef.current = [...samplesRef.current.slice(-199), { ...live.current.state }];
      setSnapshot({ ...live.current.state }); setSamples(samplesRef.current);
    }
  }, []);
  const draw = useCallback((ctx, view) => {
    const { width: w, height: h } = view;
    const p = live.current.params; const scale = Math.min(w, h) * 0.25 * p.zoom;
    ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(w / 2 + p.panX * scale, h / 2 - p.panY * scale);
    if (p.grid) {
      ctx.strokeStyle = '#121b2a'; ctx.lineWidth = 1;
      for (let i = -20; i <= 20; i++) {
        ctx.beginPath(); ctx.moveTo(i * scale / 2, -h * 4); ctx.lineTo(i * scale / 2, h * 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-w * 4, i * scale / 2); ctx.lineTo(w * 4, i * scale / 2); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#46758c'; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(0, 0, scale, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const s = live.current.state;
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s.x * scale, -s.y * scale); ctx.stroke();
    ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(s.x * scale, -s.y * scale, 9, 0, 2 * Math.PI); ctx.fill();
    ctx.restore(); ctx.fillStyle = '#a5bdd1'; ctx.font = '12px sans-serif'; ctx.fillText('Reference motion · metres · drag to pan', 20, h - 25);
  }, []);
  // Changes redraw paused canvases without advancing the scientific model.
  useEffect(() => {
    if (!running) viewport.current?.resize();
  }, [params, snapshot, running]);
  const controls = <Stack spacing={1.2}>
    <SimulationPanel title="Playback" compact><Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
      <SimulationButton onClick={() => playback({ running: !live.current.running })}>{running ? 'Pause' : 'Run'}</SimulationButton>
      <SimulationButton simulationVariant="subtle" onClick={reset}>Reset</SimulationButton>
      <SimulationButton simulationVariant="subtle" disabled={running} onClick={() => { step(0.05); setSnapshot({ ...live.current.state }); viewport.current?.resize(); }}>Step</SimulationButton>
    </Stack></SimulationPanel>
    <SimulationPanel title="Controls & camera" compact><Stack spacing={1} sx={{ py: 0.5 }}>
      <Typography>Speed · {params.speed.toFixed(1)}×</Typography><Slider aria-label="Simulation speed" min={0.1} max={4} step={0.1} value={params.speed} onChange={(_, v) => configure({ speed: v })} />
      <Typography>Camera zoom · {params.zoom.toFixed(1)}×</Typography><Slider aria-label="Camera zoom" min={0.5} max={3} step={0.1} value={params.zoom} onChange={(_, v) => configure({ zoom: v })} />
      <Typography>Camera horizontal position</Typography><Slider aria-label="Camera horizontal position" min={-10} max={10} step={0.1} value={params.panX} onChange={(_, v) => configure({ panX: v })} />
      <Typography>Camera vertical position</Typography><Slider aria-label="Camera vertical position" min={-10} max={10} step={0.1} value={params.panY} onChange={(_, v) => configure({ panY: v })} />
      <SimulationButton onClick={() => configure({ zoom: 1, panX: 0, panY: 0 })}>Fit camera</SimulationButton>
      <FormControlLabel control={<Switch checked={params.grid} onChange={(_, grid) => configure({ grid })} />} label="Coordinate grid" />
    </Stack></SimulationPanel>
    <SimulationPanel title="Measurements" compact><Box sx={{ p: 2 }}><Typography>t = {snapshot.time.toFixed(2)} s · x = {snapshot.x.toFixed(2)} m</Typography>
      <Box sx={{ height: 160 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={samples}><XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis domain={[-1, 1]} width={30} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip /><Line dataKey="x" stroke="#22d3ee" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></Box>
    </Box></SimulationPanel>
    <SimulationPanel title="Agent connection" compact><Box sx={{ p: 2 }}><Chip size="small" label={'WebMCP: ' + status} /><Typography sx={{ mt: 1, fontSize: 12 }}>UI and agent use the same state. Unsupported browsers keep all manual controls. This private reference is not a public MCP catalog entry.</Typography></Box></SimulationPanel>
    <SimulationPanel title="Video capture" compact><AgentCanvasRecorder ref={video} canvasSelector={'#' + canvasId} filePrefix="esbiko-standard-2d" /></SimulationPanel>
  </Stack>;
  return <SimulationStandardWorkspace unifiedPanel title={title} subtitle="Admin reference · reusable canvas, controls, camera, measurements and agent adapter" controls={controls}
    viewport={<SimulationCanvas2DViewport ref={viewport} canvasId={canvasId} running={running} draw={draw} step={step}
      onPointerDown={(point, event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { point, params: { ...live.current.params } }; }}
      onPointerMove={(point) => { if (!drag.current) return; const d = drag.current; const scale = Math.min(point.width, point.height) * 0.25 * d.params.zoom;
        configure({ panX: Math.max(-10, Math.min(10, d.params.panX + (point.x - d.point.x) / scale)), panY: Math.max(-10, Math.min(10, d.params.panY - (point.y - d.point.y) / scale)) }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />} />;
}
