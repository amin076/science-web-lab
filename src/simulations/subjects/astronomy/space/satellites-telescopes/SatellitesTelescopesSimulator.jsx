import React, { useEffect, useRef, useState } from "react";
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

const EDUCATIONAL_ORBIT_RADIUS_KM = {
  MOON: 32000,
  JWST: 60000,
};

function getVisualPosition(object, mode) {
  if (mode !== VIEW_MODES.EDUCATIONAL) return object.state.pos;

  if (object.type === "MOON" || object.type === "JWST") {
    const visualRadiusKm = EDUCATIONAL_ORBIT_RADIUS_KM[object.type];
    return vec.mul(vec.norm(object.state.pos), visualRadiusKm);
  }

  return object.state.pos;
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

  const [settings, setSettings] = useState({
    timeScale: 200,
    dt: 1,
    showTrails: true,
    showOrbits: true,
    showVectors: false,
    showLOS: true,
    showStars: true,
    mode: VIEW_MODES.EDUCATIONAL,
  });

  const sim = useRef({ t: 0, objects: [] });
  const viewRef = useRef({ x: 0, y: 0, k: 0.08 });

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
    setObjectsList([...sim.current.objects]);
    setSelectedObjId("ISS-unique");

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
        0.0005,
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
    sim.current.objects = sim.current.objects.filter((o) => o.type === "MOON");
    sim.current.objects.push({
      id: "ISS-unique",
      type: "ISS",
      name: "International Space Station",
      color: "#ffffff",
      state: makeCircularOrbit(408, 0),
      trail: [],
      hidden: false,
    });
    accRef.current = 0;
    lastRef.current = performance.now();
    viewRef.current = { x: 0, y: 0, k: 0.08 };
    setUiTime(0);
    setObjectsList([...sim.current.objects]);
    requestAnimationFrame(() => setRunning(true));
  };

  const addPreset = (preset) => {
    const config = SATELLITE_CONFIGS[preset];
    if (!config) return;

    if (["ISS", "HUBBLE", "JWST"].includes(config.type)) {
      const existing = sim.current.objects.find((o) => o.type === config.type);
      if (existing) {
        setSelectedObjId(existing.id);
        if (existing.hidden) {
          existing.hidden = false;
          setObjectsList([...sim.current.objects]);
        }
        return;
      }
    }

    const idPrefix = ["ISS", "HUBBLE", "JWST"].includes(config.type)
      ? `${config.type}-unique`
      : `${preset}-${Math.random().toString(36).substr(2, 9)}`;

    const newObj = {
      id: idPrefix,
      type: config.type,
      name: config.name,
      color: config.color,
      state: makeCircularOrbit(config.alt, Math.random() * 360),
      trail: [],
      hidden: false,
    };
    sim.current.objects.push(newObj);
    setObjectsList([...sim.current.objects]);
    setSelectedObjId(newObj.id);
  };

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
      canvas.width = stageW;
      canvas.height = stageH;

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

      if (selectedObjId && selectedObjId !== "EARTH") {
        const target = sim.current.objects.find((o) => o.id === selectedObjId);
        if (target) {
          const visualTargetPos = getVisualPosition(target, settings.mode);

          // In educational mode, frame Earth + Moon/JWST together.
          // Centering directly on the object hides the orbit center (Earth).
          const trackPos =
            settings.mode === VIEW_MODES.EDUCATIONAL &&
            (target.type === "MOON" || target.type === "JWST")
              ? vec.mul(visualTargetPos, 0.5)
              : visualTargetPos;

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

      drawEarthTextured(
        ctx,
        cx,
        cy,
        earthPx,
        sim.current.t * EARTH.omegaRadS,
        earthImg,
      );

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

        const pos = getVisualPosition(o, settings.mode);

        const px = { x: cx + pos.x * kmToPx, y: cy + pos.y * kmToPx };
        const dist = vec.len(pos);

        if (settings.showOrbits) {
          drawVisibleOrbitPath(ctx, cx, cy, dist * kmToPx, o.type);
        }

        if (settings.showTrails && o.trail.length > 1 && o.type !== "MOON") {
          ctx.strokeStyle = o.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.beginPath();
          o.trail.forEach((p, i) => {
            const tx = cx + p.x * kmToPx;
            const ty = cy + p.y * kmToPx;
            i === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
          });
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (o.type === "MOON") {
          const moonPx =
            settings.mode === VIEW_MODES.EDUCATIONAL
              ? earthPx * 0.28
              : o.radius * kmToPx;
          drawMoon(ctx, px.x, px.y, moonPx, moonImg, o.theta || 0);
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

          if (settings.showLOS && o.type !== "MOON") {
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

        if (selectedObjId !== "EARTH") {
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
        while (accRef.current >= settings.dt) {
          accRef.current -= settings.dt;
          sim.current.t += settings.dt;
          sim.current.objects.forEach((o) => {
            if (o.type === "MOON") return;
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
        setUiTime(sim.current.t);
      }
      render();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, settings, stageW, stageH, earthImg, moonImg, selectedObjId]);

  const recenterView = () => {
    setSelectedObjId(null);
    viewRef.current = { x: 0, y: 0, k: 0.08 };
  };
  const handleZoomIn = () => {
    viewRef.current.k = Math.min(20, viewRef.current.k * 1.2);
  };
  const handleZoomOut = () => {
    viewRef.current.k = Math.max(0.0005, viewRef.current.k / 1.2);
  };

  const checkHit = (mx, my) => {
    const { x: panX, y: panY, k: zoom } = viewRef.current;
    const cx = stageW / 2 + panX;
    const cy = stageH / 2 + panY;
    const earthScale = RENDER.EARTH_SCALE || 0.28;
    const earthPx = Math.min(stageW, stageH) * earthScale * (zoom * 5);

    if (Math.hypot(mx - cx, my - cy) < earthPx) {
      setSelectedObjId("EARTH");
      return true;
    }

    const kmToPx = earthPx / EARTH.radiusKm;
    for (let o of sim.current.objects) {
      if (o.hidden) continue;
      const pos = getVisualPosition(o, settings.mode);
      const px = cx + pos.x * kmToPx;
      const py = cy + pos.y * kmToPx;
      if (Math.hypot(mx - px, my - py) < 30) {
        setSelectedObjId(o.id);
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
      viewRef.current.k = Math.max(0.0005, Math.min(20, newK));
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
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          height: { xs: "55%", md: "auto" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        <Box
          ref={stageRef}
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

        <SatellitesTelescopesControlPanel
          settings={settings}
          setSettings={setSettings}
          onAddPreset={addPreset}
          objectsList={objectsList}
          onRemoveObject={removeObject}
          onToggleVisible={toggleVisible}
          uiTime={uiTime}
          selectedId={selectedObjId}
          onSelect={setSelectedObjId}
        />
      </Box>
    </Box>
  );
}
