// ✅ src/simulations/physics/ProjectileMotion.jsx
import { useState, useRef, useMemo } from "react";
import Sketch from "react-p5";
import {
  Box,
  Typography,
  Slider,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Chart.js registration
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ProjectileMotion() {
  const [angleDeg, setAngleDeg] = useState(45);
  const [speed, setSpeed] = useState(25);
  const [gravity, setGravity] = useState(9.81);
  const [running, setRunning] = useState(false);

  const tRef = useRef(0);
  const dt = 1 / 60;
  const pathRef = useRef([]);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const startRef = useRef({ x: 50, y: 340 });
  const scale = 5;
  const groundY = 360;

  const resetSim = () => {
    setRunning(false);
    tRef.current = 0;
    pathRef.current = [];
    posRef.current = { x: 0, y: 0 };
    const theta = (angleDeg * Math.PI) / 180;
    velRef.current = { vx: speed * Math.cos(theta), vy: speed * Math.sin(theta) };
  };

  const startOrPause = () => {
    if (!running && tRef.current === 0) {
      const theta = (angleDeg * Math.PI) / 180;
      velRef.current = { vx: speed * Math.cos(theta), vy: speed * Math.sin(theta) };
    }
    setRunning((r) => !r);
  };

  if (tRef.current === 0 && pathRef.current.length === 0) {
    const theta = (angleDeg * Math.PI) / 180;
    velRef.current = { vx: speed * Math.cos(theta), vy: speed * Math.sin(theta) };
  }

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(720, 420).parent(canvasParentRef);
    p5.frameRate(60);
  };

  const draw = (p5) => {
    p5.background(p5.color(245, 247, 250));
    for (let y = 0; y < p5.height; y++) {
      const inter = p5.map(y, 0, p5.height, 0, 1);
      const c = p5.lerpColor(p5.color(230, 244, 255), p5.color(240, 240, 250), inter);
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }

    p5.noStroke();
    p5.fill(230);
    p5.rect(0, groundY, p5.width, p5.height - groundY);

    p5.push();
    p5.stroke(180);
    p5.line(0, groundY, p5.width, groundY);
    p5.line(startRef.current.x, 0, startRef.current.x, p5.height);
    p5.pop();

    if (running) {
      tRef.current += dt;
      const theta = (angleDeg * Math.PI) / 180;
      const v0x = speed * Math.cos(theta);
      const v0y = speed * Math.sin(theta);

      const x = v0x * tRef.current;
      const y = v0y * tRef.current - 0.5 * gravity * tRef.current * tRef.current;

      posRef.current = { x, y };
      velRef.current = { vx: v0x, vy: v0y - gravity * tRef.current };

      if (y <= 0 && tRef.current > 0.05) setRunning(false);
      else pathRef.current.push({ x, y });
    }

    // Draw path
    p5.push();
    p5.noFill();
    p5.stroke(59, 130, 246, 200);
    p5.strokeWeight(2);
    p5.beginShape();
    for (const pt of pathRef.current) {
      const sx = startRef.current.x + pt.x * scale;
      const sy = groundY - pt.y * scale;
      p5.vertex(sx, sy);
    }
    p5.endShape();
    p5.pop();

    // Projectile
    const px = startRef.current.x + posRef.current.x * scale;
    const py = groundY - posRef.current.y * scale;
    p5.fill(37, 99, 235);
    p5.circle(px, py, 10);

    // Velocity vector
    p5.push();
    p5.stroke(16, 185, 129);
    p5.line(px, py, px + velRef.current.vx * 2, py - velRef.current.vy * 2);
    p5.pop();

    // HUD
    p5.push();
    p5.fill(0, 0, 0, 120);
    p5.noStroke();
    p5.rect(12, 12, 210, 82, 8);
    p5.fill(255);
    p5.textSize(12);
    p5.text(`t: ${tRef.current.toFixed(2)} s`, 24, 32);
    p5.text(`x: ${posRef.current.x.toFixed(2)} m`, 24, 48);
    p5.text(`y: ${Math.max(0, posRef.current.y).toFixed(2)} m`, 24, 64);
    p5.text(`|v|: ${Math.hypot(velRef.current.vx, velRef.current.vy).toFixed(2)} m/s`, 24, 80);
    p5.pop();
  };

  // ✅ Derived physics quantities
  const { timeOfFlight, maxHeight, range } = useMemo(() => {
    const theta = (angleDeg * Math.PI) / 180;
    const timeOfFlight = (2 * speed * Math.sin(theta)) / gravity;
    const maxHeight = (speed * speed * Math.pow(Math.sin(theta), 2)) / (2 * gravity);
    const range = (speed * speed * Math.sin(2 * theta)) / gravity;
    return { timeOfFlight, maxHeight, range };
  }, [angleDeg, speed, gravity]);

  // ✅ Generate height-time data for chart
  const chartData = useMemo(() => {
    const theta = (angleDeg * Math.PI) / 180;
    const points = [];
    for (let t = 0; t <= timeOfFlight; t += timeOfFlight / 40) {
      const y = speed * Math.sin(theta) * t - 0.5 * gravity * t * t;
      points.push({ t, y });
    }
    return {
      labels: points.map((p) => p.t.toFixed(2)),
      datasets: [
        {
          label: "Height (m)",
          data: points.map((p) => Math.max(p.y, 0)),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [angleDeg, speed, gravity, timeOfFlight]);

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {/* 🎯 Simulation Canvas */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          bgcolor: "background.paper",
        }}
      >
        <Sketch setup={setup} draw={draw} />
      </Box>

      {/* 🎛 Controls */}
      <PaperControls
        angleDeg={angleDeg}
        setAngleDeg={setAngleDeg}
        speed={speed}
        setSpeed={setSpeed}
        gravity={gravity}
        setGravity={setGravity}
        running={running}
        onStartPause={startOrPause}
        onReset={resetSim}
      />

      {/* 📊 Physics Info Panel */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "#f0f9ff",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Physics Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" justifyContent="center" spacing={4}>
          <Chip color="primary" label={`🕒 Time of Flight: ${timeOfFlight.toFixed(2)} s`} />
          <Chip color="secondary" label={`⬆ Max Height: ${maxHeight.toFixed(2)} m`} />
          <Chip color="success" label={`➡ Range: ${range.toFixed(2)} m`} />
        </Stack>
      </Paper>

      {/* 📈 Height vs Time Graph */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "#fafafa",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Height vs Time Graph
        </Typography>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </Paper>
    </Box>
  );
}

// ✅ Controls Section
function PaperControls({
  angleDeg,
  setAngleDeg,
  speed,
  setSpeed,
  gravity,
  setGravity,
  running,
  onStartPause,
  onReset,
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Controls
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <Control label="Angle (°)" value={angleDeg} onChange={setAngleDeg} min={5} max={85} step={1} />
        <Control label="Speed (m/s)" value={speed} onChange={setSpeed} min={5} max={60} step={1} />
        <Control label="Gravity (m/s²)" value={gravity} onChange={setGravity} min={1} max={20} step={0.1} />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={onStartPause}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Reset
        </Button>
        <Chip label="Tip: press Start to launch" />
      </Stack>
    </Box>
  );
}

function Control({ label, value, onChange, min, max, step }) {
  return (
    <Box sx={{ minWidth: 220 }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {label}: <strong>{value}</strong>
      </Typography>
      <Slider value={value} min={min} max={max} step={step} onChange={(_, v) => onChange(v)} />
    </Box>
  );
}
