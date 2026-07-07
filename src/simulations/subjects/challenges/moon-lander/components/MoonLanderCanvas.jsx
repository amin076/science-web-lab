import { useEffect, useRef } from "react";

const STAR_COUNT = 140;

function seededUnit(seed, multiplier) {
  return Math.abs((Math.sin(seed * multiplier) * 43758.5453) % 1);
}

const STARS = Array.from({ length: STAR_COUNT }, (_, index) => {
  const seed = index + 1;

  return {
    x: seededUnit(seed, 19.19),
    y: seededUnit(seed, 41.73),
    size: 0.45 + seededUnit(seed, 9.31) * 1.35,
    alpha: 0.25 + seededUnit(seed, 13.7) * 0.58,
  };
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawLander(ctx, x, y, angle, scale, thrusting, danger) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.shadowBlur = danger ? scale * 0.45 : scale * 0.25;
  ctx.shadowColor = danger ? "rgba(255, 94, 94, 0.58)" : "rgba(112, 220, 255, 0.45)";

  ctx.lineWidth = Math.max(1.8, scale * 0.065);
  ctx.strokeStyle = "rgba(225, 248, 255, 0.96)";
  ctx.fillStyle = "rgba(205, 231, 245, 0.96)";

  ctx.beginPath();
  ctx.moveTo(0, -scale * 0.95);
  ctx.lineTo(scale * 0.62, scale * 0.18);
  ctx.lineTo(scale * 0.34, scale * 0.74);
  ctx.lineTo(-scale * 0.34, scale * 0.74);
  ctx.lineTo(-scale * 0.62, scale * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  const cockpit = ctx.createRadialGradient(
    0,
    -scale * 0.14,
    scale * 0.08,
    0,
    -scale * 0.14,
    scale * 0.34
  );
  cockpit.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  cockpit.addColorStop(0.45, "rgba(104, 229, 255, 0.82)");
  cockpit.addColorStop(1, "rgba(34, 112, 190, 0.28)");
  ctx.fillStyle = cockpit;
  ctx.beginPath();
  ctx.arc(0, -scale * 0.14, scale * 0.26, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(160, 217, 255, 0.92)";
  ctx.lineWidth = Math.max(1.6, scale * 0.055);
  ctx.beginPath();
  ctx.moveTo(-scale * 0.3, scale * 0.66);
  ctx.lineTo(-scale * 0.76, scale * 1.1);
  ctx.moveTo(scale * 0.3, scale * 0.66);
  ctx.lineTo(scale * 0.76, scale * 1.1);
  ctx.moveTo(-scale * 0.92, scale * 1.1);
  ctx.lineTo(-scale * 0.58, scale * 1.1);
  ctx.moveTo(scale * 0.58, scale * 1.1);
  ctx.lineTo(scale * 0.92, scale * 1.1);
  ctx.stroke();

  if (thrusting) {
    ctx.shadowBlur = scale * 0.9;
    ctx.shadowColor = "rgba(79, 219, 255, 0.7)";
    const flame = ctx.createRadialGradient(
      0,
      scale * 1.04,
      scale * 0.06,
      0,
      scale * 1.62,
      scale * 0.88
    );
    flame.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    flame.addColorStop(0.25, "rgba(90, 226, 255, 0.9)");
    flame.addColorStop(0.62, "rgba(255, 186, 82, 0.66)");
    flame.addColorStop(1, "rgba(255, 112, 64, 0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-scale * 0.28, scale * 0.74);
    ctx.quadraticCurveTo(-scale * 0.1, scale * 1.58, 0, scale * 2.2);
    ctx.quadraticCurveTo(scale * 0.1, scale * 1.58, scale * 0.28, scale * 0.74);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function createCamera(cssWidth, cssHeight, world, lander, pad) {
  const worldWidth = world.maxX - world.minX;
  const worldHeight = world.ceilingY - world.groundY;
  const baseScale = Math.min(cssWidth / worldWidth, cssHeight / worldHeight);
  const zoom = cssWidth < 680 ? 1.42 : 1.68;
  const scale = baseScale * zoom;
  const viewWidth = cssWidth / scale;
  const viewHeight = cssHeight / scale;
  const targetX = lander.position.x * 0.64 + pad.x * 0.36;
  const targetY = Math.max(lander.position.y * 0.78 + world.groundY * 0.22, 140);
  const left = clamp(targetX - viewWidth / 2, world.minX, world.maxX - viewWidth);
  const bottom = clamp(
    targetY - viewHeight * 0.42,
    world.groundY,
    world.ceilingY - viewHeight
  );

  return {
    scale,
    left,
    bottom,
    top: bottom + viewHeight,
  };
}

function drawScene(canvas, state, input) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  const { lander, mission } = state;
  const { world, landingPad, thresholds } = mission;
  const camera = createCamera(cssWidth, cssHeight, world, lander, landingPad);
  const toScreenX = (x) => (x - camera.left) * camera.scale;
  const toScreenY = (y) => (camera.top - y) * camera.scale;
  const groundY = toScreenY(world.groundY);
  const padX = toScreenX(landingPad.x);
  const padWidth = landingPad.width * camera.scale;
  const verticalSpeed = Math.abs(lander.velocity.y);
  const horizontalSpeed = Math.abs(lander.velocity.x);
  const tilt = Math.abs(lander.angle);
  const danger =
    verticalSpeed > thresholds.maxVerticalSpeed * 1.35 ||
    horizontalSpeed > thresholds.maxHorizontalSpeed * 1.45 ||
    tilt > thresholds.maxTilt * 1.25;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const sky = ctx.createLinearGradient(0, 0, 0, cssHeight);
  sky.addColorStop(0, "#0c1931");
  sky.addColorStop(0.42, "#071126");
  sky.addColorStop(1, "#090a12");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const planetGlow = ctx.createRadialGradient(
    cssWidth * 0.77,
    cssHeight * 0.18,
    10,
    cssWidth * 0.77,
    cssHeight * 0.18,
    cssWidth * 0.36
  );
  planetGlow.addColorStop(0, "rgba(195, 225, 255, 0.55)");
  planetGlow.addColorStop(0.18, "rgba(85, 151, 220, 0.22)");
  planetGlow.addColorStop(1, "rgba(15, 30, 70, 0)");
  ctx.fillStyle = planetGlow;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  STARS.forEach((star) => {
    ctx.fillStyle = `rgba(224, 240, 255, ${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x * cssWidth, star.y * cssHeight * 0.78, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(68, 88, 112, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, groundY - 30);
  for (let x = 0; x <= cssWidth; x += 72) {
    const ridge = Math.sin(x * 0.011 + camera.left * 0.01) * 22;
    ctx.lineTo(x, groundY - 30 + ridge);
  }
  ctx.lineTo(cssWidth, cssHeight);
  ctx.lineTo(0, cssHeight);
  ctx.closePath();
  ctx.fill();

  const terrain = ctx.createLinearGradient(0, groundY - 20, 0, cssHeight);
  terrain.addColorStop(0, "rgba(126, 128, 118, 0.74)");
  terrain.addColorStop(1, "rgba(37, 37, 42, 0.96)");
  ctx.fillStyle = terrain;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= cssWidth; x += 38) {
    const ridge =
      Math.sin(x * 0.018 + camera.left * 0.012) * 10 +
      Math.sin(x * 0.043) * 4;
    ctx.lineTo(x, groundY + ridge);
  }
  ctx.lineTo(cssWidth, cssHeight);
  ctx.lineTo(0, cssHeight);
  ctx.closePath();
  ctx.fill();

  const beam = ctx.createLinearGradient(0, groundY - 220, 0, groundY);
  beam.addColorStop(0, "rgba(99, 255, 215, 0)");
  beam.addColorStop(0.55, "rgba(99, 255, 215, 0.12)");
  beam.addColorStop(1, "rgba(99, 255, 215, 0.28)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(padX - padWidth * 0.34, groundY);
  ctx.lineTo(padX - padWidth * 0.08, Math.max(0, groundY - cssHeight * 0.34));
  ctx.lineTo(padX + padWidth * 0.08, Math.max(0, groundY - cssHeight * 0.34));
  ctx.lineTo(padX + padWidth * 0.34, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 26;
  ctx.shadowColor = "rgba(76, 255, 211, 0.55)";
  ctx.fillStyle = "rgba(72, 255, 208, 0.26)";
  ctx.strokeStyle = "rgba(127, 255, 225, 0.98)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(padX - padWidth / 2, groundY - 9, padWidth, 14, 7);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(203, 255, 243, 0.92)";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TRAINING PAD", padX, groundY - 20);

  const landerScale = clamp(camera.scale * 23, 28, 46);
  drawLander(
    ctx,
    toScreenX(lander.position.x),
    toScreenY(lander.position.y),
    lander.angle,
    landerScale,
    input.mainThrust && lander.fuel > 0,
    danger
  );

  if (input.mainThrust && lander.position.y < 95) {
    const dustY = groundY - 4;
    ctx.fillStyle = "rgba(220, 214, 178, 0.12)";
    ctx.beginPath();
    ctx.ellipse(toScreenX(lander.position.x), dustY, 76, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export default function MoonLanderCanvas({ state, input }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return undefined;

    function resizeCanvas() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !state) return;

    drawScene(canvas, state, input);
  }, [input, state]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#071126",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Moon Lander mission canvas"
        role="img"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
