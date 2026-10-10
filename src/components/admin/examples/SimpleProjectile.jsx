import SimulationTransparentHUD from '@/components/simulation-ui/SimulationTransparentHUD';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Chip, Slider, Stack, Switch, FormControlLabel, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SimulationStandardWorkspace from '@/components/simulation-ui/SimulationStandardWorkspace';
import SimulationCanvas2DViewport from '@/components/simulation-ui/SimulationCanvas2DViewport';
import SimulationPanel from '@/components/simulation-ui/SimulationPanel';
import SimulationButton from '@/components/simulation-ui/SimulationButton';
import AgentCanvasRecorder from '@/components/shared/video/AgentCanvasRecorder';
import { useAgentSimulationTools } from '@/webmcp/useAgentSimulationTools';
import { advanceProjectile, sampleProjectile, defaultProjectileParameters, projectileParameters, validateProjectilePatch, physicsKeys, projectileCamera } from './simpleProjectileModel';

// Private scientific pilot: accepted standard workspace + Esbiko Physics.
export default function SimpleProjectile({ title = 'Simple Projectile', simulationId = 'admin.example.simple-projectile' }) {
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState({ ...defaultProjectileParameters });
  const [snapshot, setSnapshot] = useState(sampleProjectile(0, defaultProjectileParameters));
  const [samples, setSamples] = useState([]);
  const live = useRef({ running, params, state: snapshot });
  const samplesRef = useRef([]);
  const trailRef = useRef([]);
  const nextSample = useRef(0);
  const viewport = useRef(null);
  const video = useRef(null);
  const drag = useRef(null);
  const canvasId = 'simple-projectile-canvas';
  const configure = useCallback((patch) => {
    validateProjectilePatch(patch);
    const next = { ...live.current.params, ...patch };
    if (physicsKeys.some(key => Object.hasOwn(patch,key) && patch[key] !== live.current.params[key])) {
      live.current.running = false; setRunning(false);
      live.current.state = sampleProjectile(0,next);
      samplesRef.current = []; trailRef.current=[]; nextSample.current = 0;
      setSnapshot(live.current.state); setSamples([]);
    }
    live.current.params = next;
    setParams(next);
    return next;
  }, []);
  const playback = useCallback(({ running: value }) => {
    if (typeof value !== 'boolean') throw new Error('running must be boolean');
    if (value && live.current.state.landed) {
      live.current.state = sampleProjectile(0,live.current.params);
      samplesRef.current=[]; trailRef.current=[]; nextSample.current=0; setSnapshot(live.current.state);setSamples([]);
    }
    live.current.running = value; setRunning(value); return { running: value };
  }, []);
  const reset = useCallback(() => {
    playback({ running: false });
    live.current.state = sampleProjectile(0, defaultProjectileParameters);
    samplesRef.current = []; trailRef.current=[]; nextSample.current = 0;
    setSnapshot(live.current.state); setSamples([]);
    configure({ ...defaultProjectileParameters });
    return { ...live.current.state, running: false };
  }, [configure, playback]);
  const status = useAgentSimulationTools({ simulationId, prefix: 'simple_projectile', properties: projectileParameters,
    actions: { getState: () => ({ ...live.current.state, running: live.current.running, parameters: live.current.params, model: live.current.params.airResistance ? 'uniform gravity + constant-Cd spherical quadratic drag; RK4' : 'uniform gravity, vacuum; no contact impulse' }),
      configure, setPlayback: playback, reset,
      startVideo: (input) => video.current.startVideo(input), stopVideo: () => video.current.stopVideo(),
      getVideoStatus: () => video.current.getVideoStatus(), downloadVideo: () => video.current.downloadVideo() } });
  const step = useCallback((dt) => {
    if(!trailRef.current.length) trailRef.current=[{x:live.current.state.x,y:live.current.state.y}];
    live.current.state = advanceProjectile(live.current.state, dt, live.current.params);
    trailRef.current.push({x:live.current.state.x,y:live.current.state.y});
    if(trailRef.current.length>1200)trailRef.current=trailRef.current.filter((_,i)=>i%2===0||i===trailRef.current.length-1);
    if(live.current.state.landed) { live.current.running=false;setRunning(false); }
    if (live.current.state.time >= nextSample.current || live.current.state.landed) {
      nextSample.current = live.current.state.time + 0.1;
      samplesRef.current = [...samplesRef.current.slice(-199), { ...live.current.state }];
      setSnapshot({ ...live.current.state }); setSamples(samplesRef.current);
    }
  }, []);
  const draw = useCallback((ctx, view) => {
    const {width:w,height:h}=view,p=live.current.params,s=live.current.state;
    const {scale,originX:ox,originY:oy}=projectileCamera(view,p);
    ctx.fillStyle='#030308';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(ox,oy);
    if(p.grid) {
      const spacing=Math.pow(10,Math.floor(Math.log10(50/scale)));
      ctx.strokeStyle='#172238';ctx.fillStyle='#738ba3';ctx.font='11px sans-serif';
      const xmin=Math.floor(-ox/scale/spacing)*spacing,xmax=(w-ox)/scale;
      for(let x=xmin;x<=xmax;x+=spacing){ctx.beginPath();ctx.moveTo(x*scale,-h);ctx.lineTo(x*scale,h);ctx.stroke();ctx.fillText(x.toFixed(0)+' m',x*scale+3,18);}
      const ymin=Math.floor((oy-h)/scale/spacing)*spacing,ymax=oy/scale;
      for(let y=ymin;y<=ymax;y+=spacing){ctx.beginPath();ctx.moveTo(-w,-y*scale);ctx.lineTo(w,-y*scale);ctx.stroke();}
    }
    ctx.fillStyle='#0b1924';ctx.fillRect(-ox,0,w,h);
    ctx.strokeStyle='#52778d';ctx.beginPath();ctx.moveTo(-ox,0);ctx.lineTo(w-ox,0);ctx.stroke();
    ctx.strokeStyle='#22d3ee';ctx.lineWidth=3;ctx.beginPath();
    trailRef.current.forEach((q,i)=>{if(i===0)ctx.moveTo(q.x*scale,-q.y*scale);else ctx.lineTo(q.x*scale,-q.y*scale);});ctx.stroke();
    const x=s.x*scale,y=-s.y*scale;
    ctx.fillStyle='#67e8f9';ctx.shadowColor='#22d3ee';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(x,y,7,0,2*Math.PI);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#a5bdd1';ctx.font='12px sans-serif';ctx.fillText('Launch',0,-p.launchHeight*scale-16);
    const arrow=(dx,dy,color,label)=>{if(Math.hypot(dx,dy)<0.3)return;const endX=x+dx,endY=y+dy,a=Math.atan2(dy,dx);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.stroke();ctx.beginPath();ctx.moveTo(endX,endY);ctx.lineTo(endX-9*Math.cos(a-0.45),endY-9*Math.sin(a-0.45));ctx.lineTo(endX-9*Math.cos(a+0.45),endY-9*Math.sin(a+0.45));ctx.closePath();ctx.fill();ctx.fillText(label,endX+5,endY-6);};
    const velocityScale=Math.min(3,100/p.launchSpeed);
    if(p.velocityComponents){arrow(s.vx*velocityScale,0,'#fb923c','vx');arrow(0,-s.vy*velocityScale,'#a78bfa','vy');}
    if(p.velocityVector)arrow(s.vx*velocityScale,-s.vy*velocityScale,'#facc15','v');
    ctx.restore();ctx.fillStyle='#a5bdd1';ctx.font='12px sans-serif';ctx.fillText('Esbiko Physics · '+(p.airResistance?'spherical air drag':'vacuum')+' · drag to pan',20,h-15);
  }, []);
  const apiRef=useRef(null);
  apiRef.current={version:'simple-projectile-api.v1',getCapabilities:()=>({version:'simple-projectile-api.v1',parameters:structuredClone(projectileParameters),commands:['configure','setPlayback','reset','step'],transport:'mounted admin browser SDK; not HTTP',recording:['landscape','shorts']}),getState:()=>structuredClone({...live.current.state,running:live.current.running,parameters:live.current.params}),
    configure, setPlayback:playback,reset,step:(dt=0.05)=>{if(live.current.running)throw new Error('Pause before manual step');if(!Number.isFinite(dt)||dt<0||dt>0.05)throw new RangeError('dt must be 0..0.05');step(dt);setSnapshot({...live.current.state});viewport.current?.resize();return structuredClone(live.current.state);},
    startVideo:(input)=>video.current.startVideo(input),stopVideo:()=>video.current.stopVideo(),getVideoStatus:()=>video.current.getVideoStatus(),downloadVideo:()=>video.current.downloadVideo()};
  useEffect(()=>{const sdk=new Proxy({}, {get:(_,key)=>{const method=apiRef.current?.[key];return typeof method==='function'?(...args)=>method(...args):method;}});
    window.esbikoSimpleProjectile=sdk;return()=>{if(window.esbikoSimpleProjectile===sdk)delete window.esbikoSimpleProjectile;};},[]);
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
    <SimulationPanel title="Launch conditions" compact><Stack spacing={1} sx={{py:0.5}}>
      {[['launchSpeed','Launch speed','m/s',1],['angleDeg','Launch angle','°',1],['launchHeight','Launch height','m',1],['gravity','Gravity','m/s²',0.1]].map(([key,label,unit,increment]) => <Box key={key}><Typography>{label} · {params[key].toFixed(1)} {unit}</Typography><Slider aria-label={label} min={projectileParameters[key].minimum} max={projectileParameters[key].maximum} step={increment} value={params[key]} onChange={(_,v)=>configure({[key]:v})} /></Box>)}
      <Typography sx={{fontSize:12,color:'#94a3b8'}}>Changing physical settings resets the flight. Stops at ground; velocity at touchdown is pre-impact.</Typography>
    </Stack></SimulationPanel>
    <SimulationPanel title="Air resistance · sphere" compact><Stack spacing={1} sx={{py:0.5}}>
      <FormControlLabel control={<Switch checked={params.airResistance} onChange={(_,airResistance)=>configure({airResistance})} />} label="Enable air resistance" />
      {[['dragCoefficient','Drag coefficient Cd',0.01,''],['massKg','Mass',0.1,'kg'],['radiusM','Sphere radius',0.01,'m'],['airDensity','Air density',0.025,'kg/m³']].map(([key,label,increment,unit])=><Box key={key}><Typography>{label} · {params[key].toFixed(3)} {unit}</Typography><Slider aria-label={label} min={projectileParameters[key].minimum} max={projectileParameters[key].maximum} step={increment} value={params[key]} onChange={(_,v)=>configure({[key]:v})} /></Box>)}
      <Typography sx={{fontSize:12,color:'#94a3b8'}}>Approximate constant-Cd quadratic drag, frontal area of a sphere. No wind, lift or spin.</Typography>
    </Stack></SimulationPanel>
    <SimulationPanel title="Velocity & HUD" compact><Stack spacing={0.5}>
      <FormControlLabel control={<Switch checked={params.velocityVector} onChange={(_,velocityVector)=>configure({velocityVector})} />} label="Velocity vector · yellow" />
      <FormControlLabel control={<Switch checked={params.velocityComponents} onChange={(_,velocityComponents)=>configure({velocityComponents})} />} label="Components vx / vy · orange / purple" />
      <FormControlLabel control={<Switch checked={params.hudVisible} onChange={(_,hudVisible)=>configure({hudVisible})} />} label="Show transparent HUD" />
      <Typography>Speed {snapshot.speedMps.toFixed(2)} m/s</Typography><Typography>vx {snapshot.vx.toFixed(2)} · vy {snapshot.vy.toFixed(2)} m/s</Typography>
    </Stack></SimulationPanel>
    <SimulationPanel title="Controls & camera" compact><Stack spacing={1} sx={{ py: 0.5 }}>
      <Typography>Speed · {params.speed.toFixed(1)}×</Typography><Slider aria-label="Simulation speed" min={0.1} max={4} step={0.1} value={params.speed} onChange={(_, v) => configure({ speed: v })} />
      <Typography>Camera zoom · {params.zoom.toFixed(1)}×</Typography><Slider aria-label="Camera zoom" min={0.5} max={3} step={0.1} value={params.zoom} onChange={(_, v) => configure({ zoom: v })} />
      <Typography>Camera horizontal position</Typography><Slider aria-label="Camera horizontal position" min={-10} max={10} step={0.1} value={params.panX} onChange={(_, v) => configure({ panX: v })} />
      <Typography>Camera vertical position</Typography><Slider aria-label="Camera vertical position" min={-10} max={10} step={0.1} value={params.panY} onChange={(_, v) => configure({ panY: v })} />
      <SimulationButton onClick={() => configure({ zoom: 1, panX: 0, panY: 0 })}>Fit camera</SimulationButton>
      <FormControlLabel control={<Switch checked={params.grid} onChange={(_, grid) => configure({ grid })} />} label="Coordinate grid" />
    </Stack></SimulationPanel>
    <SimulationPanel title="Measurements" compact><Box sx={{ p: 2 }}><Typography>t = {snapshot.time.toFixed(2)} s · height = {snapshot.y.toFixed(2)} m</Typography>
      <Typography sx={{fontSize:12,color:'#94a3b8'}}>Distance {snapshot.x.toFixed(2)} m · peak reached {snapshot.maxHeight.toFixed(2)} m · {snapshot.landed ? 'flight ' + snapshot.flightTime.toFixed(2) + ' s' : 'in progress'}</Typography><Typography sx={{fontSize:12,color:'#94a3b8'}}>Height (m) vs time (s)</Typography><Box sx={{ height: 160 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={samples}><XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis domain={[0, 'auto']} width={30} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip /><Line dataKey="y" stroke="#22d3ee" dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></Box>
    </Box></SimulationPanel>
    <SimulationPanel title="Agent connection" compact><Box sx={{ p: 2 }}><Chip size="small" label={'WebMCP: ' + status} /><Typography sx={{ mt: 1, fontSize: 12 }}>UI and agent use the same state. Unsupported browsers keep all manual controls. This private reference is not a public MCP catalog entry.</Typography></Box></SimulationPanel>
    <SimulationPanel title="Video capture" compact><AgentCanvasRecorder ref={video} canvasSelector={'#' + canvasId} filePrefix="esbiko-simple-projectile" /></SimulationPanel>
  </Stack>;
  return <SimulationStandardWorkspace hudPlacement="top-right" hudPointerEvents="none" unifiedPanel title={title} subtitle="Private pilot · Esbiko Physics 0.1 · standard 2D workspace" controls={controls}
    hud={<SimulationTransparentHUD visible={params.hudVisible} onVisibleChange={(hudVisible) => configure({ hudVisible })}
      title="Live coordinates" rows={[
        { label: 'Time', value: snapshot.time.toFixed(2) + ' s' },
        { label: 'Position', value: snapshot.x.toFixed(2) + ', ' + snapshot.y.toFixed(2) + ' m' },
        { label: 'Speed |v|', value: snapshot.speedMps.toFixed(2) + ' m/s' },
        { label: 'vx / vy', value: snapshot.vx.toFixed(2) + ' / ' + snapshot.vy.toFixed(2) + ' m/s' },
        { label: 'Playback', value: snapshot.landed ? 'Landed' : running ? 'Running' : 'Ready / paused' },
      ]} />}
    viewport={<SimulationCanvas2DViewport ref={viewport} canvasId={canvasId} running={running} draw={draw} step={step}
      onPointerDown={(point, event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { point, params: { ...live.current.params } }; }}
      onPointerMove={(point) => { if (!drag.current) return; const d = drag.current; const scale = projectileCamera(point,d.params).scale;
        configure({ panX: Math.max(-10, Math.min(10, d.params.panX + (point.x - d.point.x) / scale)), panY: Math.max(-10, Math.min(10, d.params.panY - (point.y - d.point.y) / scale)) }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />} />;
}
