import { useEffect, useRef } from "react";

const STAR_COUNT = 110;

function createStars() {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const seed = index + 1;
    const x = (Math.sin(seed * 19.19) * 43758.5453) % 1;
    const y = (Math.sin(seed * 41.73) * 24634.6345) % 1;
    const size = 0.6 + ((seed * 17) % 9) / 10;

    return {
      x: Math.abs(x),
      y: Math.abs(y),
      size,
      alpha: 0.3 + ((seed * 13) % 7) / 10,
    };
  });
}

function drawLander(ctx, x, y, angle, scale, thrusting) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.lineWidth = Math.max(1.5, scale * 0.08);
  ctx.strokeStyle = "rgba(216, 245, 255, 0.95)";
  ctx.fillStyle = "rgba(176, 220, 255, 0.95)";

  ctx.beginPath();
  ctx.moveTo(0, -scale * 0.9);
  ctx.lineTo(scale * 0.65, scale * 0.35);
  ctx.lineTo(scale * 0.28, scale * 0.82);
  ctx.lineTo(-scale * 0.28, scale * 0.82);
  ctx.lineTo(-scale * 0.65, scale * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(148, 211, 255, 0.9)";
  ctx.beginPath();
  ctx.moveTo(-scale * 0.32, scale * 0.72);
  ctx.lineTo(-scale * 0.72, scale * 1.08);
  ctx.moveTo(scale * 0.32, scale * 0.72);
  ctx.lineTo(scale * 0.72, scale * 1.08);
  ctx.stroke();

  if (thrusting) {
    const gradient = ctx.createRadialGradient(
      0,
      scale * 1.15,
      scale * 0.1,
      0,
      scale * 1.55,
      scale * 0.8
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    gradient.addColorStop(0.35, "rgba(125, 229, 255, 0.78)");
    gradient.addColorStop(1, "rgba(255, 156, 83, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-scale * 0.24, scale * 0.82);
    ctx.lineTo(0, scale * 2.15);
    ctx.lineTo(scale * 0.24, scale * 0.82);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawScene(canvas, state, input) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = width / dpr;
  const cssHeight = height / dpr;
  const world = state.mission.world;
  const worldWidth = world.maxX - world.minX;
  const worldHeight = world.ceilingY - world.groundY;
  const scale = Math.min(cssWidth / worldWidth, cssHeight / worldHeight);
  const offsetX = (cssWidth - worldWidth * scale) / 2;
  const offsetY = (cssHeight - worldHeight * scale) / 2;
  const toScreenX = (x) => offsetX + (x - world.minX) * scale;
  const toScreenY = (y) => offsetY + (world.ceilingY - y) * scale;
  const groundY = toScreenY(world.groundY);
  const lander = state.lander;
  const stars = createStars();

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const sky = ctx.createLinearGradient(0, 0, 0, cssHeight);
  sky.addColorStop(0, "#030716");
  sky.addColorStop(0.48, "#07122a");
  sky.addColorStop(1, "#101015");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  stars.forEach((star) => {
    ctx.fillStyle = `rgba(215, 237, 255, ${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x * cssWidth, star.y * cssHeight * 0.82, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  const moonGlow = ctx.createRadialGradient(
    cssWidth * 0.72,
    cssHeight * 0.14,
    8,
    cssWidth * 0.72,
    cssHeight * 0.14,
    cssWidth * 0.28
  );
  moonGlow.addColorStop(0, "rgba(138, 198, 255, 0.26)");
  moonGlow.addColorStop(1, "rgba(138, 198, 255, 0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.fillStyle = "rgba(124, 134, 150, 0.28)";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= cssWidth; x += 42) {
    const ridge = Math.sin(x * 0.014) * 12 + Math.sin(x * 0.031) * 6;
    ctx.lineTo(x, groundY + ridge);
  }
  ctx.lineTo(cssWidth, cssHeight);
  ctx.lineTo(0, cssHeight);
  ctx.closePath();
  ctx.fill();

  const pad = state.mission.landingPad;
  const padX = toScreenX(pad.x);
  const padWidth = pad.width * scale;
  ctx.fillStyle = "rgba(92, 255, 195, 0.24)";
  ctx.strokeStyle = "rgba(110, 255, 216, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(padX - padWidth / 2, groundY - 7, padWidth, 11, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(182, 255, 237, 0.9)";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LANDING PAD", padX, groundY - 16);

  drawLander(
    ctx,
    toScreenX(lander.position.x),
    toScreenY(lander.position.y),
    lander.angle,
    Math.max(18, 24 * scale),
    input.mainThrust && lander.fuel > 0
  );

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
        background: "#030716",
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
