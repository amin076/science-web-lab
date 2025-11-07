import { useRef, useState } from "react";
import Sketch from "react-p5";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Slider,
  Divider,
  IconButton,
} from "@mui/material";
import { getProjectilePosition, getProjectileVelocity } from "@/physics/projectile";
import { randomColor } from "@/physics/projectile";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

export default function MultiProjectileMotion() {
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const dt = 1 / 60;
  const gravity = 9.81;
  const groundY = 360;
  const scale = 5;

  // 🎯 ۳ توپ قابل کنترل
  const [projectiles, setProjectiles] = useState([
    { id: 1, x0: 0, y0: 0, v0: 25, angle: 45, color: randomColor(), path: [] },
    { id: 2, x0: 10, y0: 0, v0: 35, angle: 55, color: randomColor(), path: [] },
    { id: 3, x0: 20, y0: 10, v0: 20, angle: 40, color: randomColor(), path: [] },
  ]);

  const setup = (p5, parent) => {
    p5.createCanvas(720, 420).parent(parent);
    p5.frameRate(60);
  };

  const draw = (p5) => {
    p5.background(245);
    // آسمان
    for (let y = 0; y < p5.height; y++) {
      const inter = p5.map(y, 0, p5.height, 0, 1);
      const c = p5.lerpColor(p5.color("#e0f2fe"), p5.color("#f8fafc"), inter);
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }

    // زمین و محور‌ها
    p5.noStroke();
    p5.fill("#d4d4d8");
    p5.rect(0, groundY, p5.width, p5.height - groundY);
    p5.stroke(180);
    p5.line(40, 0, 40, p5.height);
    p5.line(0, groundY, p5.width, groundY);

    // محاسبات فیزیک
    if (running) {
      tRef.current += dt;
      setProjectiles((prev) =>
        prev.map((ball) => {
          const pos = getProjectilePosition(ball.v0, ball.angle, gravity, tRef.current, ball.y0, ball.x0);
          const vel = getProjectileVelocity(ball.v0, ball.angle, gravity, tRef.current);
          if (pos.y >= 0) {
            ball.path.push({ ...pos, vx: vel.vx, vy: vel.vy });
            if (ball.path.length > 800) ball.path.shift();
          }
          return ball;
        })
      );
    }

    // رسم مسیر و توپ‌ها
    projectiles.forEach((ball) => {
      p5.stroke(ball.color);
      p5.noFill();
      p5.beginShape();
      ball.path.forEach((pt) => p5.vertex(50 + pt.x * scale, groundY - pt.y * scale));
      p5.endShape();

      const last = ball.path[ball.path.length - 1];
      if (last) {
        p5.fill(ball.color);
        p5.noStroke();
        p5.circle(50 + last.x * scale, groundY - last.y * scale, 10);
      }
    });

    // زمان
    p5.fill(0);
    p5.textSize(14);
    p5.text(`t = ${tRef.current.toFixed(2)} s`, 20, 20);
  };

  const toggleRun = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    tRef.current = 0;
    setProjectiles((prev) => prev.map((b) => ({ ...b, path: [] })));
  };

  const updateBall = (id, field, value) => {
    setProjectiles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        🎯 Multi-Projectile Motion Simulation
      </Typography>

      <Paper
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          mb: 2,
        }}
      >
        <Sketch setup={setup} draw={draw} />
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
          onClick={toggleRun}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={reset}>
          Reset
        </Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        ⚙️ Individual Controls
      </Typography>

      {/* کنترل جداگانه برای هر توپ */}
      {projectiles.map((ball) => (
        <Paper
          key={ball.id}
          sx={{
            p: 2,
            mb: 2,
            borderLeft: `6px solid ${ball.color}`,
            bgcolor: "#f9fafb",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Ball #{ball.id}
          </Typography>

          <Stack spacing={1}>
            <SliderControl
              label="Angle (°)"
              value={ball.angle}
              min={5}
              max={85}
              step={1}
              onChange={(v) => updateBall(ball.id, "angle", v)}
            />
            <SliderControl
              label="Speed (m/s)"
              value={ball.v0}
              min={5}
              max={60}
              step={1}
              onChange={(v) => updateBall(ball.id, "v0", v)}
            />
            <SliderControl
              label="Height (m)"
              value={ball.y0}
              min={0}
              max={30}
              step={1}
              onChange={(v) => updateBall(ball.id, "y0", v)}
            />
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function SliderControl({ label, value, onChange, min, max, step }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {label}: <strong>{value}</strong>
      </Typography>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v)}
      />
    </Box>
  );
}
