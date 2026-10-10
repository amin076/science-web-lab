import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  ZoomIn,
  ZoomOut,
  MyLocation,
} from "@mui/icons-material";
import SatellitesTelescopesControlPanel from "./SatellitesTelescopesControlPanel.jsx";
import SatellitesHUD from "./SatellitesHUD.jsx";
import {
  EARTH,
  groundTelescopeECI,
  isVisibleFromGround,
  makeCircularOrbit,
  rk4Step,
  moonStateECI,
  lunarRelativeState,
} from "./satellites.physics.js";
import {
  SATELLITE_CONFIGS,
  RENDER,
  ASSETS,
  VIEW_MODES,
  MOON,
} from "./satellites.constants.js";
import {
  drawEarthTextured,
  drawMoon,
  drawStars,
  drawISS,
  drawSatellite,
  drawTelescope,
  drawOrbitPath,
  drawHubble,
  drawJWST,
} from "./satellites.render.js";
import { vec } from "./satellites.math.js";
import { educationalPosition } from "./educationalScale.js";
import { drawSun, sunDisplayGeometry, earthSolarOrbit, drawEarthSolarOrbit, drawSunlightDirection, drawEarthSunlitHemisphere } from "./sunContext.js";

function useResizeObserver(ref) {
  const [size, setSize] = useState({ w: 800, h: 500 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({
        w: Math.max(1, e.contentRect.width),
        h: Math.max(1, e.contentRect.height),
      });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

const getTouchDist = (t1, t2) => {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
};

function getVisualPosition(object, mode) {
  return mode === VIEW_MODES.EDUCATIONAL
    ? educationalPosition(object.state.pos)
    : object.state.pos;
}

function drawVisibleOrbitPath(ctx, cx, cy, radiusPx, type) {
  ctx.save();

  if (type === "MOON") {
    ctx.strokeStyle = "rgba(160, 220, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
  } else if (type === "JWST") {
    ctx.strokeStyle = "rgba(255, 193, 7, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([10, 8]);
  } else {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export default function SatellitesTelescopesSimulator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const { w: stageW, h: stageH } = useResizeObserver(stageRef);

  const [running, setRunning] = useState(true);
  const [uiTime, setUiTime] = useState(0);
  const [objectsList, setObjectsList] = useState([]);
  const [selectedObjId, setSelectedObjId] = useState(null);

  const [earthImg, setEarthImg] = useState(null);
  const [moonImg, setMoonImg] = useState(null);

  const defaults=useMemo(()=>({
    timeScale:200,dt:1,showTrails:true,showOrbits:true,showVectors:false,
    showLOS:true,showStars:true,mode:VIEW_MODES.EDUCATIONAL,
  }),[]);
  const initial=useMemo(()=>readEmbeddedMcpParameters("astronomy.space.satellites-telescopes",{...defaults,zoom:0.03}).values,[defaults]);
  const [settings, setSettings] = useState(()=>{const {zoom,...rest}=initial;return rest;});

  const sim = useRef({ t: 0, objects: [] });
  const viewRef = useRef({ x: 0, y: 0, k: initial.zoom });

  const dragRef = useRef({
    active: false,
    mode: "pan",
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    startDist: 0,
    startK: 0,
  });

  const starsRef = useRef(null);
  const lastRef = useRef(performance.now());
  const rafRef = useRef(null);
  const accRef = useRef(0);

  useEffect(() => {
    const eImg = new Image();
    eImg.src = ASSETS.EARTH_TEXTURE;
    eImg.onload = () => setEarthImg(eImg);
    const mImg = new Image();
    mImg.src = ASSETS.MOON_TEXTURE;
    mImg.onload = () => setMoonImg(mImg);
  }, []);

  useEffect(() => {
    sim.current.objects = [
      {
        id: "MOON",
        type: "MOON",
        name: "The Moon",
        color: "#DDDDDD",
        state: { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } },
        trail: [],
        radius: MOON.radiusKm,
        theta: 0,
      },
      {
        id: "ISS-unique",
        type: "ISS",
        name: "International Space Station",
        color: "#ffffff",
        state: makeCircularOrbit(408, 0),
        trail: [],
        hidden: false,
      },
    ];
    for(const preset of ["TIANGONG","HUBBLE","JWST","STARLINK","LRO","CAPSTONE","GATEWAY"]) {
      const c=SATELLITE_CONFIGS[preset];
      sim.current.objects.push({id:preset+"-unique",type:c.type,name:c.name,color:c.color,centralBody:c.centralBody||"EARTH",planned:!!c.planned,
        state:c.type==="JWST"?{pos:{x:1500000,y:0},vel:{x:0,y:0}}:c.centralBody==="MOON"?{pos:vec.add(moonStateECI(0).pos,lunarRelativeState(c,0).pos),vel:{x:0,y:0}}:makeCircularOrbit(c.alt,90),trail:[],hidden:false});
    }
    setObjectsList([...sim.current.objects]);
    setSelectedObjId("SUN");

    if (!starsRef.current) {
      const spread = RENDER.STARS_AREA * 50;
      starsRef.current = Array.from({ length: RENDER.STARS_COUNT }, () => ({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      }));
    }
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      viewRef.current.k = Math.max(
        0.000001,
        Math.min(20, viewRef.current.k * (1 + delta)),
      );
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const reset = () => {
    setRunning(false);
    sim.current.t = 0;
    sim.current.objects.forEach(o => {
      const config=Object.values(SATELLITE_CONFIGS).find(c=>c.name===o.name);
      if(o.type === "MOON") o.state={pos:moonStateECI(0).pos,vel:{x:0,y:0}};
      else if(o.type === "JWST") o.state={pos:{x:1500000,y:0},vel:{x:0,y:0}};
      else if(o.centralBody === "MOON") {const rel=lunarRelativeState(config,0);o.state={pos:vec.add(moonStateECI(0).pos,rel.pos),vel:rel.vel};}
      else o.state=makeCircularOrbit(config?.alt ?? Math.max(1,vec.len(o.state.pos)-EARTH.radiusKm),0);
      o.trail=[];o.hidden=false;
    });
    accRef.current = 0;
    lastRef.current = performance.now();
    selectObject("SUN");
    setUiTime(0);
    setObjectsList([...sim.current.objects]);
    requestAnimationFrame(() => setRunning(true));
  };

  const addPreset = (preset) => {
    const config = SATELLITE_CONFIGS[preset];
    if (!config) return;

    if (config.type !== "satellite") {
      const existing = sim.current.objects.find((o) => o.type === config.type);
      if (existing) {
        selectObject(existing.id);
        if (existing.hidden) {
          existing.hidden = false;
          setObjectsList([...sim.current.objects]);
        }
        return;
      }
    }

    const idPrefix = config.type !== "satellite"
      ? `${config.type}-unique`
      : `${preset}-${Math.random().toString(36).substr(2, 9)}`;

    const newObj = {
      id: idPrefix,
      type: config.type,
      name: config.name,
      color: config.color,
      centralBody: config.centralBody || "EARTH",
      planned: !!config.planned,
      state: config.type === "JWST" ? {pos:{x:1500000,y:0},vel:{x:0,y:0}}
        : config.centralBody === "MOON" ? {pos:moonStateECI(sim.current.t).pos,vel:{x:0,y:0}}
        : makeCircularOrbit(config.alt, Math.random() * 360),
      trail: [],
      hidden: false,
    };
    sim.current.objects.push(newObj);
    setObjectsList([...sim.current.objects]);
    selectObject(newObj.id);
  };

  const selectObject = (id) => {
    if (id === "SUN") {
      const scale = RENDER.EARTH_SCALE || 0.28;
      // Fit Sun and Earth with margins, in both display modes.
      viewRef.current.k = Math.min(stageW * 0.65, stageH * 0.65) * EARTH.radiusKm /
        ((earthSolarOrbit().a * 2.2) * Math.min(stageW, stageH) * scale * 5);
    }
    const target=sim.current.objects.find(o=>o.id===id);
    if(id !== "SUN") {
      const radius = target?.type === "JWST" ? 2000000 : id === "MOON" || target?.centralBody === "MOON"
        ? MOON.radiusKm*(target?.type === "LRO" ? 4 : 50) : EARTH.radiusKm*4;
      viewRef.current.k = Math.min(20, EARTH.radiusKm * 0.35 / (radius * (RENDER.EARTH_SCALE || 0.28) * 5));
    }
    setSelectedObjId(id);
  };

  // A scale switch must reveal the Sun even when previously tracking a satellite.
  const previousModeRef = useRef(settings.mode);
  useEffect(() => {
    const modeChanged = previousModeRef.current !== settings.mode;
    previousModeRef.current = settings.mode;
    if (modeChanged || selectedObjId === "SUN") selectObject("SUN");
  }, [settings.mode, stageW, stageH, selectedObjId]);

  const removeObject = (id) => {
    if (id === "MOON") return;
    const idx = sim.current.objects.findIndex((o) => o.id === id);
    if (idx !== -1) {
      sim.current.objects.splice(idx, 1);
      setObjectsList([...sim.current.objects]);
      if (selectedObjId === id) setSelectedObjId(null);
    }
  };

  const toggleVisible = (id) => {
    const obj = sim.current.objects.find((o) => o.id === id);
    if (obj) {
      obj.hidden = !obj.hidden;
      setObjectsList([...sim.current.objects]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const pixelW = Math.round(stageW * dpr), pixelH = Math.round(stageH * dpr);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { x: panX, y: panY, k: zoom } = viewRef.current;
      const earthScale = RENDER.EARTH_SCALE || 0.28;
      const earthPx = Math.min(stageW, stageH) * earthScale * (zoom * 5);

      if (earthPx <= 0) return;
      const kmToPx = earthPx / EARTH.radiusKm;

      const moon = sim.current.objects.find((o) => o.type === "MOON");
      if (moon) {
        const ms = moonStateECI(sim.current.t);
        moon.state.pos = ms.pos;
        moon.theta = ms.theta;
      }

      if (selectedObjId === "SUN") {
        const sun = sunDisplayGeometry(settings.mode, sim.current.t);
        const orbit=earthSolarOrbit(sim.current.t);
        viewRef.current.x = -orbit.centerX * kmToPx;
        viewRef.current.y = -orbit.centerY * kmToPx;
      } else if (selectedObjId && selectedObjId !== "EARTH") {
        const target = sim.current.objects.find((o) => o.id === selectedObjId);
        if (target) {
          const visualTargetPos = getVisualPosition(target, settings.mode);

          // Webb is shown beyond Earth along the anti-solar direction.
          const trackPos = target.type === "JWST" ? vec.mul(visualTargetPos,0.5) : visualTargetPos;

          viewRef.current.x = -trackPos.x * kmToPx;
          viewRef.current.y = -trackPos.y * kmToPx;
        }
      } else if (selectedObjId === "EARTH") {
        viewRef.current.x = 0;
        viewRef.current.y = 0;
      }

      const cx = stageW / 2 + viewRef.current.x;
      const cy = stageH / 2 + viewRef.current.y;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, stageW, stageH);
      if (settings.showStars && starsRef.current) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(kmToPx * 200, kmToPx * 200);
        drawStars(ctx, starsRef.current, zoom);
        ctx.restore();
      }

      const sun = sunDisplayGeometry(settings.mode, sim.current.t);
      if (settings.showOrbits) drawEarthSolarOrbit(ctx,cx,cy,kmToPx,sim.current.t);
      drawSun(ctx, cx + sun.x * kmToPx, cy, sun.radius * kmToPx);
      ctx.fillStyle="#94a3b8"; ctx.font="11px sans-serif";
      ctx.fillText("Linear km scale · tiny bodies / spacecraft use labelled markers",12,stageH-170);
      ctx.fillText("Earth ellipse: e = 0.0167 · Sun at a focus · 147.1–152.1 million km",12,stageH-154);
      drawSunlightDirection(ctx, cx, cy, earthPx, stageW, stageH);

      drawEarthTextured(
        ctx,
        cx,
        cy,
        earthPx,
        sim.current.t * EARTH.omegaRadS,
        earthImg,
      );
      drawEarthSunlitHemisphere(ctx, cx, cy, earthPx);
      if (earthPx < 3) {
        // Visibility marker only: the physical Earth radius remains unchanged.
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Earth–Moon system · marker", cx, cy - 12);
        ctx.textAlign = "start";
      }


      const site = groundTelescopeECI(sim.current.t, 0);
      const sitePx = {
        x: cx + site.pos.x * kmToPx,
        y: cy + site.pos.y * kmToPx,
      };

      if (earthPx > 5) {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(
          sitePx.x,
          sitePx.y,
          Math.max(1, earthPx * 0.05),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        if (zoom > 0.1) {
          ctx.fillStyle = "#FFF";
          ctx.font = "10px sans-serif";
          ctx.fillText("Ground Station", sitePx.x + 6, sitePx.y - 6);
        }
      }

      sim.current.objects.forEach((o) => {
        if (o.hidden) return;
        // At solar-system zoom, mission icons would overlap in one pixel cluster.
        // Mission selection opens a local view without changing any distances.
        if (earthPx < 3 && o.type !== "MOON" && o.id !== selectedObjId) return;

        const pos = getVisualPosition(o, settings.mode);

        const px = { x: cx + pos.x * kmToPx, y: cy + pos.y * kmToPx };
        const dist = vec.len(pos);

        if (settings.showOrbits && o.type !== "JWST") {
          if (o.centralBody === "MOON") {
            const ms=moonStateECI(sim.current.t), rel=lunarRelativeState(SATELLITE_CONFIGS[o.type],sim.current.t);
            ctx.save();ctx.strokeStyle=o.color;ctx.lineWidth=1;ctx.setLineDash(o.planned?[4,4]:[]);
            ctx.beginPath();ctx.ellipse(cx+ms.pos.x*kmToPx,cy+(ms.pos.y-rel.a*rel.e)*kmToPx,rel.b*kmToPx,rel.a*kmToPx,0,0,Math.PI*2);ctx.stroke();ctx.restore();
          } else drawVisibleOrbitPath(ctx, cx, cy, dist * kmToPx, o.type);
        }
        if (o.type === "JWST") {
          ctx.fillStyle="#fde68a";ctx.font="11px sans-serif";
          ctx.fillText("JWST · L2 · away from Sun · 1.5 million km",px.x+12,px.y+20);
        }

        if (settings.showTrails && o.trail.length > 1 && o.type !== "MOON") {
          ctx.strokeStyle = o.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          o.trail.forEach((p, i) => {
            const trailPos = settings.mode === VIEW_MODES.EDUCATIONAL
              ? educationalPosition(p) : p;
            const tx = cx + trailPos.x * kmToPx;
            const ty = cy + trailPos.y * kmToPx;
            i === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
          });
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (o.type === "MOON") {
          const moonPx = o.radius * kmToPx;
          drawMoon(ctx, px.x, px.y, moonPx, moonImg, o.theta || 0);
          if(moonPx < 2) {ctx.fillStyle="#cbd5e1";ctx.beginPath();ctx.arc(px.x,px.y,2,0,Math.PI*2);ctx.fill();}
          ctx.fillStyle="#cbd5e1";ctx.font="11px sans-serif";if(earthPx >= 3) ctx.fillText(moonPx < 2 ? "Moon · marker" : "Moon",px.x+8,px.y-12);
        } else {
          const spriteScale = Math.max(0.15, Math.min(2.5, zoom * 4));

          ctx.save();
          ctx.translate(px.x, px.y);
          ctx.scale(spriteScale, spriteScale);
          ctx.translate(-px.x, -px.y);

          if (o.type === "ISS") drawISS(ctx, px.x, px.y, o.state.vel);
          else if (o.type === "HUBBLE")
            drawHubble(ctx, px.x, px.y, o.state.vel);
          else if (o.type === "JWST") drawJWST(ctx, px.x, px.y, o.state.vel);
          else if (o.type === "telescope")
            drawTelescope(ctx, px.x, px.y, o.color);
          else drawSatellite(ctx, px.x, px.y, o.color);
          ctx.restore();

          ctx.fillStyle=o.color;ctx.font="11px sans-serif";
          if(o.type !== "JWST") ctx.fillText(o.name,px.x+10,px.y-10);
          if (settings.showLOS && o.centralBody !== "MOON" && o.type !== "JWST") {
            const visible = isVisibleFromGround(site, o.state.pos);
            if (visible) {
              ctx.strokeStyle = "#00E676";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(sitePx.x, sitePx.y);
              ctx.lineTo(px.x, px.y);
              ctx.stroke();
            }
          }
        }
      });

      if (
        selectedObjId &&
        !sim.current.objects.find((o) => o.id === selectedObjId)?.hidden
      ) {
        let px = { x: cx, y: cy };
        let radius = earthPx + 10;

        if (selectedObjId === "SUN") {
          const sun = sunDisplayGeometry(settings.mode, sim.current.t);
          px = { x: cx + sun.x * kmToPx, y: cy };
          radius = Math.max(6, sun.radius * kmToPx) * 1.7 + 8;
        } else if (selectedObjId !== "EARTH") {
          const obj = sim.current.objects.find((o) => o.id === selectedObjId);
          if (obj) {
            const pos = getVisualPosition(obj, settings.mode);
            px = { x: cx + pos.x * kmToPx, y: cy + pos.y * kmToPx };
            radius = 25;
          }
        }

        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        const time = performance.now() / 500;
        ctx.arc(px.x, px.y, radius, time, time + Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px.x, px.y, radius, time + Math.PI, time + Math.PI * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const tick = (now) => {
      const dtReal = (now - lastRef.current) / 1000;
      lastRef.current = now;
      if (running) {
        accRef.current += dtReal * settings.timeScale;
        let steps=0;
        while (accRef.current >= settings.dt && steps++ < 80) {
          accRef.current -= settings.dt;
          sim.current.t += settings.dt;
          sim.current.objects.forEach((o) => {
            if (o.type === "MOON" || o.type === "JWST") return;
            if (o.centralBody === "MOON") {
              const ms=moonStateECI(sim.current.t), rel=lunarRelativeState(SATELLITE_CONFIGS[o.type],sim.current.t);
              o.state={pos:vec.add(ms.pos,rel.pos),vel:rel.vel}; o.trail=[]; return;
            }
            const ns = rk4Step(o.state, settings.dt);
            if (settings.showTrails) {
              o.trail.push({ x: ns.pos.x, y: ns.pos.y });
              if (o.trail.length > RENDER.TRAIL_MAX_LENGTH) o.trail.shift();
            } else {
              o.trail.length = 0;
            }
            o.state = ns;
          });
        }
        if(steps >= 80) accRef.current=0;
        setUiTime(sim.current.t);
      }
      render();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, settings, stageW, stageH, earthImg, moonImg, selectedObjId]);


  const liveRef=useRef({});
  liveRef.current={running,settings,selectedObjId,uiTime,objects:sim.current.objects.map(({id,type,name,hidden,state,centralBody,planned})=>({id,type,name,hidden:!!hidden,state,centralBody,planned})),zoom:viewRef.current.k};
  const functionsRef=useRef({});
  functionsRef.current={setRunning,setSettings,setSelectedObjId:selectObject,reset,addPreset,removeObject,toggleVisible};
  useEffect(()=>{
    const controller=new AbortController(),empty={type:"object",properties:{},additionalProperties:false};
    const fields={
      timeScale:{type:"number",minimum:0,maximum:2000},
      dt:{type:"number",minimum:0.1,maximum:60},
      showTrails:{type:"boolean"},showOrbits:{type:"boolean"},showVectors:{type:"boolean"},
      showLOS:{type:"boolean"},showStars:{type:"boolean"},
      mode:{type:"string",enum:[VIEW_MODES.EDUCATIONAL,VIEW_MODES.REALISTIC]},
      zoom:{type:"number",minimum:0.000001,maximum:20},
    };
    const snapshot=()=>({simulationId:"astronomy.space.satellites-telescopes",state:{
      ...liveRef.current,objects:sim.current.objects.map(({id,type,name,hidden,state,centralBody,planned})=>({id,type,name,hidden:!!hidden,state,centralBody,planned})),zoom:viewRef.current.k,time:sim.current.t,
    }});
    const tools=[
      {name:"esbiko_satellites_get_state",description:"Read orbital time, objects, current positions, visibility, selection and display configuration.",inputSchema:empty,annotations:{readOnlyHint:true},execute:createSafeToolExecutor("satellites_get_state",async()=>snapshot())},
      {name:"esbiko_satellites_configure",description:"Change orbit simulation time scale, integrator step, trail/orbit/vectors visibility, scale mode and zoom.",inputSchema:{type:"object",properties:fields,additionalProperties:false},execute:createSafeToolExecutor("satellites_configure",async(input)=>{
        if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Expected satellite settings");
        for(const [key,value] of Object.entries(input)){const rule=fields[key];if(!rule||typeof value!==rule.type||(rule.enum&&!rule.enum.includes(value))||(rule.type==="number"&&(!Number.isFinite(value)||value<rule.minimum||value>rule.maximum)))throw Error("Invalid satellite option: "+key);}
        const {zoom,...next}=input;
        if(zoom!==undefined)viewRef.current.k=zoom;
        if(Object.keys(next).length)functionsRef.current.setSettings(old=>({...old,...next}));
        return {accepted:input};
      })},
      {name:"esbiko_satellites_add_preset",description:"Add an Earth or lunar mission preset; Gateway is planned and lunar paths are illustrative.",inputSchema:{type:"object",properties:{preset:{type:"string",enum:Object.keys(SATELLITE_CONFIGS)}},required:["preset"],additionalProperties:false},execute:createSafeToolExecutor("satellites_add_preset",async({preset})=>{
        if(!(preset in SATELLITE_CONFIGS))throw Error("Unknown satellite preset");
        functionsRef.current.addPreset(preset);
        return {preset,objects:sim.current.objects.length};
      })},
      {name:"esbiko_satellites_select",description:"Select Sun, Earth or an orbital object by ID; Sun selection frames Sun and Earth.",inputSchema:{type:"object",properties:{id:{type:"string"}},required:["id"],additionalProperties:false},execute:createSafeToolExecutor("satellites_select",async({id})=>{
        if(id!=="SUN"&&id!=="EARTH"&&!sim.current.objects.some(o=>o.id===id))throw Error("Unknown object");
        functionsRef.current.setSelectedObjId(id);return {selectedId:id};
      })},
      {name:"esbiko_satellites_set_visibility",description:"Show or hide any satellite object; Moon always remains.",inputSchema:{type:"object",properties:{id:{type:"string"},visible:{type:"boolean"}},required:["id","visible"],additionalProperties:false},execute:createSafeToolExecutor("satellites_set_visibility",async({id,visible})=>{
        const obj=sim.current.objects.find(o=>o.id===id);
        if(!obj||obj.type==="MOON"||typeof visible!=="boolean")throw Error("Invalid object visibility");
        if(!!obj.hidden===visible)functionsRef.current.toggleVisible(id);
        return {id,visible};
      })},
      {name:"esbiko_satellites_remove",description:"Remove an existing satellite (Moon cannot be removed).",inputSchema:{type:"object",properties:{id:{type:"string"}},required:["id"],additionalProperties:false},execute:createSafeToolExecutor("satellites_remove",async({id})=>{
        if(!sim.current.objects.some(o=>o.id===id&&o.type!=="MOON"))throw Error("Unknown removable object");
        functionsRef.current.removeObject(id);return {removed:id};
      })},
      {name:"esbiko_satellites_set_playback",description:"Start or pause satellite physics.",inputSchema:{type:"object",properties:{running:{type:"boolean"}},required:["running"],additionalProperties:false},execute:createSafeToolExecutor("satellites_set_playback",async({running})=>{
        if(typeof running!=="boolean")throw Error("running must be boolean");
        functionsRef.current.setRunning(running);return {running};
      })},
      {name:"esbiko_satellites_reset",description:"Reset orbit time and all displayed mission reference positions and zoom.",inputSchema:empty,execute:createSafeToolExecutor("satellites_reset",async()=>{functionsRef.current.reset();return {reset:true};})},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal})
      .catch(error=>{if(!controller.signal.aborted)console.warn("Satellite MCP",error);});
    return ()=>controller.abort();
  },[]);
  const recenterView = () => selectObject("SUN");
  const handleZoomIn = () => {
    viewRef.current.k = Math.min(20, viewRef.current.k * 1.2);
  };
  const handleZoomOut = () => {
    viewRef.current.k = Math.max(0.000001, viewRef.current.k / 1.2);
  };

  const checkHit = (mx, my) => {
    const { x: panX, y: panY, k: zoom } = viewRef.current;
    const cx = stageW / 2 + panX;
    const cy = stageH / 2 + panY;
    const earthScale = RENDER.EARTH_SCALE || 0.28;
    const earthPx = Math.min(stageW, stageH) * earthScale * (zoom * 5);

    if (Math.hypot(mx - cx, my - cy) < earthPx) {
      selectObject("EARTH");
      return true;
    }

    const kmToPx = earthPx / EARTH.radiusKm;
    const sun = sunDisplayGeometry(settings.mode, sim.current.t);
    if (Math.hypot(mx - (cx + sun.x * kmToPx), my - cy) < Math.max(12, sun.radius * kmToPx)) {
      selectObject("SUN");
      return true;
    }
    for (let o of sim.current.objects) {
      if (o.hidden) continue;
      const pos = getVisualPosition(o, settings.mode);
      const px = cx + pos.x * kmToPx;
      const py = cy + pos.y * kmToPx;
      if (Math.hypot(mx - px, my - py) < 30) {
        selectObject(o.id);
        return true;
      }
    }
    return false;
  };

  const handleMouseDown = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (checkHit(mx, my)) return;

    if (selectedObjId) setSelectedObjId(null);
    dragRef.current = {
      active: true,
      mode: "pan",
      startX: e.clientX,
      startY: e.clientY,
      initX: viewRef.current.x,
      initY: viewRef.current.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    if (dragRef.current.mode === "pan") {
      viewRef.current.x =
        dragRef.current.initX + (e.clientX - dragRef.current.startX);
      viewRef.current.y =
        dragRef.current.initY + (e.clientY - dragRef.current.startY);
    }
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = stageRef.current.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;

      if (checkHit(mx, my)) return;
      if (selectedObjId) setSelectedObjId(null);

      dragRef.current = {
        active: true,
        mode: "pan",
        startX: touch.clientX,
        startY: touch.clientY,
        initX: viewRef.current.x,
        initY: viewRef.current.y,
      };
    } else if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      dragRef.current = {
        active: true,
        mode: "pinch",
        startDist: dist,
        startK: viewRef.current.k,
      };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!dragRef.current.active) return;

    if (dragRef.current.mode === "pan" && e.touches.length === 1) {
      const touch = e.touches[0];
      viewRef.current.x =
        dragRef.current.initX + (touch.clientX - dragRef.current.startX);
      viewRef.current.y =
        dragRef.current.initY + (touch.clientY - dragRef.current.startY);
    } else if (dragRef.current.mode === "pinch" && e.touches.length === 2) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const scaleFactor = dist / dragRef.current.startDist;
      const newK = dragRef.current.startK * scaleFactor;
      viewRef.current.k = Math.max(0.000001, Math.min(20, newK));
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.active = false;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 0, md: 2 },
        p: { xs: 0, md: 2 },
        bgcolor: { xs: "#000", md: "transparent" },
        overflowY: isMobile ? "auto" : "hidden",
        minWidth:0,
      }}
    >
      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          height: { xs: "min(58dvh, 540px)", md: "auto" },
          minHeight: {xs:290,md:0},
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        <Box
          ref={stageRef}
          data-esbiko-satellites-stage
          sx={{
            flex: 1,
            position: "relative",
            bgcolor: "#000",
            borderRadius: { xs: 0, md: 2 },
            overflow: "hidden",
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            touchAction: "none",
            borderBottom: { xs: "1px solid #333", md: "none" },
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Paper sx={{ borderRadius: "50%" }}>
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </Paper>
            <Paper sx={{ borderRadius: "50%" }}>
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Paper>
          </Box>

          {/* Fixed HUD overlay: stays legible above all canvas objects and orbit trails. */}
          <Box data-esbiko-sun-context sx={{
            position: "absolute", bottom: 12, left: 12, zIndex: 20,
            width: { xs: 198, sm: 248 }, boxSizing: "border-box",
            p: 1.25, borderRadius: 2, pointerEvents: "none",
            bgcolor: "rgba(2,6,23,0.94)",
            border: "1px solid rgba(251,191,36,0.65)",
            boxShadow: "0 5px 18px rgba(0,0,0,0.65)",
          }}>
            <Box sx={{ color: "#fde68a", fontSize: 12, fontWeight: 800 }}>
              ☀ Sun · Earth · Moon
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 0.5 }}>
              <Box aria-label="Sun" sx={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "radial-gradient(circle at 35% 35%, #fff7ad, #fbbf24 55%, #ea580c)",
                boxShadow: "0 0 18px 5px rgba(251,191,36,0.55)",
              }}/>
              <Box sx={{ flex: 1, borderTop: "2px dashed #fbbf24", minWidth: 8 }}/>
              <Box aria-label="Earth" sx={{ width: 15, height: 15, borderRadius: "50%", bgcolor: "#3b82f6",
                border: "2px solid #93c5fd", flexShrink: 0 }}/>
              <Box aria-label="Moon" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#cbd5e1", flexShrink: 0 }}/>
            </Box>
            <Box sx={{ fontSize: 10, color: "#f8fafc" }}>Earth–Sun: 149.6 million km (mean)</Box>
            <Box sx={{fontSize:10,color:"#fde68a"}}>Sun → Earth → L2 / Webb</Box>
            <Box sx={{fontSize:9,color:"#cbd5e1"}}>Webb: 1.5 million km beyond Earth</Box>
            {settings.mode === VIEW_MODES.REALISTIC && <Box sx={{ fontSize: 9, color: "#cbd5e1" }}>
              Main scene: linear distances and radii; tiny bodies use markers.
            </Box>}
            <Box sx={{ fontSize: 10, color: "#cbd5e1" }}>Moon: 384,400 km from Earth</Box>
            <Box sx={{ fontSize: 9, color: "#fbbf24", mt: 0.4 }}>
              {settings.mode === VIEW_MODES.EDUCATIONAL ? "Education" : "Realistic"} · inset not to scale
            </Box>
          </Box>

          <SatellitesHUD
            selectedObjId={selectedObjId}
            objectsList={objectsList}
            uiTime={uiTime}
          />
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: 340 },
          flex: { xs: 1, md: "none" },
          height: { xs: "auto", md: "100%" },
          minHeight:{xs:320,md:0},
          overflowY: "auto", // Allow scrolling
          bgcolor: { xs: "#121212", md: "transparent" },
        }}
      >
        {isMobile && (
          <Box
            sx={{
              p: 1,
              display: "flex",
              gap: 1,
              justifyContent: "space-between",
              borderBottom: "1px solid #333",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={reset}
                variant="contained"
                color="error"
                size="small"
              >
                Reset
              </Button>
              <Button
                onClick={() => setRunning(!running)}
                variant="contained"
                color={running ? "warning" : "success"}
                size="small"
              >
                {running ? <Pause /> : <PlayArrow />}
              </Button>
            </Box>
            <IconButton onClick={recenterView} size="small">
              <MyLocation />
            </IconButton>
          </Box>
        )}

        <div data-esbiko-satellites-controls><SatellitesTelescopesControlPanel
          settings={settings}
          setSettings={setSettings}
          onAddPreset={addPreset}
          objectsList={objectsList}
          onRemoveObject={removeObject}
          onToggleVisible={toggleVisible}
          uiTime={uiTime}
          selectedId={selectedObjId}
          onSelect={selectObject}
        /></div>
      </Box>
    </Box>
  );
}
