// src/utils/canvasDrawing.js

// ✅ Helper to flip coordinates from Physics (Bottom-Left 0,0) to Canvas (Top-Left 0,0)
const toCanvasY = (y, height) => height - y;

export const drawBackground = (ctx, width, height) => {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  // Sky color: Darker at top, lighter at bottom (horizon)
  bgGradient.addColorStop(0, "rgba(20, 28, 60, 1)");
  bgGradient.addColorStop(1, "rgba(30, 35, 70, 1)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
};

export const drawGrid = (ctx, width, height, meterScale = 50) => {
  ctx.save();
  ctx.strokeStyle = "rgba(100, 120, 150, 0.3)";
  ctx.lineWidth = 1;
  ctx.font = "11px Arial";
  ctx.fillStyle = "rgba(150, 180, 220, 0.8)";

  // Vertical Lines (X Axis)
  ctx.textAlign = "center";
  for (let x = 0; x <= width; x += meterScale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    // Label: Pixels / 50 = Meters
    if (x > 0 && x % (meterScale * 2) === 0)
      ctx.fillText(`${x / meterScale}m`, x, height - 5); // Draw labels at bottom
  }

  // Horizontal Lines (Y Axis)
  ctx.textAlign = "left";
  for (let y = 0; y <= height; y += meterScale) {
    // Convert Physics Y to Canvas Y
    const canvasY = toCanvasY(y, height);

    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(width, canvasY);
    ctx.stroke();

    // Label: Y is 0 at bottom
    if (y > 0 && y % (meterScale * 2) === 0)
      ctx.fillText(`${y / meterScale}m`, 5, canvasY - 3);
  }
  ctx.restore();
};

export const drawBall = (ctx, ball) => {
  ctx.save();
  // ✅ Convert Y
  const canvasY = toCanvasY(ball.y, ctx.canvas.height);

  const gradient = ctx.createRadialGradient(
    ball.x - ball.radius / 3,
    canvasY - ball.radius / 3,
    0,
    ball.x,
    canvasY,
    ball.radius
  );

  if (ball.active) {
    gradient.addColorStop(0, "#ff9999");
    gradient.addColorStop(0.5, ball.color);
    gradient.addColorStop(1, "#cc5555");
  } else {
    gradient.addColorStop(0, "#ffcccc");
    gradient.addColorStop(1, `${ball.color}88`);
  }

  ctx.beginPath();
  ctx.arc(ball.x, canvasY, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = ball.active ? "white" : "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (ball.active) {
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BALL", ball.x, canvasY - ball.radius - 8);
  }
  ctx.restore();
};

export const drawCar = (ctx, car) => {
  ctx.save();
  // ✅ Convert Y
  const canvasY = toCanvasY(car.y, ctx.canvas.height);

  ctx.translate(car.x, canvasY);

  // Angle Logic: Since Y is flipped, we negate vy to get correct visual rotation
  const angle = Math.atan2(-car.vy, car.vx);
  if (Math.abs(car.vx) > 0.1 || Math.abs(car.vy) > 0.1) ctx.rotate(angle);

  ctx.fillStyle = car.active ? car.color : `${car.color}88`;
  ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(-car.width / 2, -car.height / 2, car.width, car.height);

  ctx.fillStyle = "rgba(200, 230, 255, 0.6)";
  ctx.fillRect(car.width / 6, -car.height / 3, car.width / 4, car.height / 1.8);

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(car.width / 4, car.height / 2, 5, 0, Math.PI * 2);
  ctx.arc(-car.width / 4, car.height / 2, 5, 0, Math.PI * 2);
  ctx.fill();

  if (car.active) {
    ctx.rotate(-angle);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CAR", 0, -car.height / 2 - 10);
  }
  ctx.restore();
};

export const drawVelocityVector = (ctx, obj, scale = 0.1) => {
  const speed = Math.sqrt(obj.vx ** 2 + obj.vy ** 2);
  if (speed < 0.1 && Math.abs(obj.vx) < 0.1 && Math.abs(obj.vy) < 0.1) return;

  const canvasY = toCanvasY(obj.y, ctx.canvas.height);

  ctx.save();
  ctx.lineCap = "round";

  // 1. Vx (Blue)
  if (Math.abs(obj.vx) > 1) {
    const endX = obj.x + obj.vx * scale;
    ctx.strokeStyle = "#4ECDC4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obj.x, canvasY);
    ctx.lineTo(endX, canvasY);
    ctx.stroke();
  }

  // 2. Vy (Green)
  if (Math.abs(obj.vy) > 1) {
    // Note: Moving UP in physics (+vy) means moving DOWN in pixels (-pixels)
    // So we subtract (vy * scale) from canvasY
    const endY = canvasY - obj.vy * scale;

    ctx.strokeStyle = "#95E1D3";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obj.x, canvasY);
    ctx.lineTo(obj.x, endY);
    ctx.stroke();
  }

  // 3. V Total (Red)
  if (speed > 1) {
    const endX = obj.x + obj.vx * scale;
    const endY = canvasY - obj.vy * scale; // Convert physics vy to visual offset

    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(obj.x, canvasY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrow head logic
    const angle = Math.atan2(endY - canvasY, endX - obj.x);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - 10 * Math.cos(angle - Math.PI / 6),
      endY - 10 * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - 10 * Math.cos(angle + Math.PI / 6),
      endY - 10 * Math.sin(angle + Math.PI / 6)
    );
    ctx.fillStyle = "#FF6B6B";
    ctx.fill();
  }
  ctx.restore();
};

export const drawObjectInfo = (ctx, obj, canvasWidth, canvasHeight) => {
  const canvasY = toCanvasY(obj.y, canvasHeight);

  const panelWidth = 140;
  const panelHeight = 115;

  // Try to position panel near the object, but keep it on screen
  let panelX = obj.vx > 0 ? obj.x - panelWidth - 35 : obj.x + 35;
  let panelY = obj.vy > 0 ? canvasY - panelHeight - 45 : canvasY + 45;

  panelX = Math.max(10, Math.min(panelX, canvasWidth - panelWidth - 10));
  panelY = Math.max(10, Math.min(panelY, canvasHeight - panelHeight - 10));

  ctx.save();
  ctx.fillStyle = "rgba(20, 25, 45, 0.9)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(100, 150, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const startX = panelX + 10;
  let currentY = panelY + 22;

  ctx.font = "bold 13px Arial";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "left";
  ctx.fillText(obj.type.toUpperCase(), startX, currentY);
  currentY += 25;

  ctx.font = "11px monospace";

  const mToPx = 50;
  const data = [
    { label: "X", value: (obj.x / mToPx).toFixed(1) + "m", color: "#FF6B6B" },
    { label: "Y", value: (obj.y / mToPx).toFixed(1) + "m", color: "#FF6B6B" },
    {
      label: "Vx",
      value: (obj.vx / mToPx).toFixed(1) + "m/s",
      color: "#4ECDC4",
    },
    {
      label: "Vy",
      value: (obj.vy / mToPx).toFixed(1) + "m/s",
      color: "#95E1D3",
    },
  ];

  data.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.textAlign = "left";
    ctx.fillText(`${item.label}:`, startX, currentY);
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(item.value, panelX + panelWidth - 10, currentY);
    currentY += 16;
  });

  // Connecting Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(obj.x, canvasY);
  ctx.lineTo(panelX + panelWidth / 2, panelY + panelHeight / 2);
  ctx.stroke();
  ctx.restore();
};

export const drawTrail = (ctx, trail) => {
  if (!trail || trail.length < 2) return;
  const height = ctx.canvas.height;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  // Move to the first point, converting Physics Y -> Canvas Y
  ctx.moveTo(trail[0].x, toCanvasY(trail[0].y, height));

  for (let i = 1; i < trail.length; i++) {
    // Draw line, converting Physics Y -> Canvas Y
    ctx.lineTo(trail[i].x, toCanvasY(trail[i].y, height));
  }

  ctx.stroke();
  ctx.restore();
};

export const drawMouseCursor = (ctx, pos) => {
  ctx.save();
  const height = ctx.canvas.height;
  const METER = 50;

  // 1. Draw Cursor Circle
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Draw Coordinates Text (Converted to Meters)
  // Mouse X is already 0-Left.
  // Mouse Y is 0-Top, so we convert it to Physics Y (0-Bottom) for display.
  const physicsXMeters = (pos.x / METER).toFixed(1);
  const physicsYMeters = (toCanvasY(pos.y, height) / METER).toFixed(1);

  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.textAlign = "left";

  // Display e.g., "(5.2m, 3.1m)" next to cursor
  ctx.fillText(`(${physicsXMeters}m, ${physicsYMeters}m)`, pos.x + 20, pos.y);

  ctx.restore();
};
// Spring-Mass Drawing Functions

export const drawSpringBackground = (ctx, width, height) => {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "rgba(20, 28, 60, 1)");
  bgGradient.addColorStop(1, "rgba(30, 35, 70, 1)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
};

export const drawSpring = (ctx, { startX, startY, endX, endY, k, color }) => {
  ctx.save();

  const totalLength = endY - startY;
  const coils = 15;
  const amplitude = 20;
  const segmentHeight = totalLength / coils;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let i = 0; i <= coils; i++) {
    const y = startY + i * segmentHeight;
    const x = startX + (i % 2 === 0 ? amplitude : -amplitude);
    ctx.lineTo(x, y);
  }

  ctx.lineTo(endX, endY);

  // Spring color based on compression/extension
  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, `${color}88`);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.stroke();

  // Draw mounting point
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(startX - 50, startY - 10, 100, 10);

  ctx.restore();
};

export const drawMass = (ctx, { x, y, radius, mass, color }) => {
  ctx.save();

  // Mass gradient
  const gradient = ctx.createRadialGradient(
    x - radius / 3,
    y - radius / 3,
    0,
    x,
    y,
    radius
  );
  gradient.addColorStop(0, "#ffaaaa");
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, "#cc5555");

  // Draw mass
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw mass label
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${mass}kg`, x, y);

  ctx.restore();
};

export const drawSpringVectors = (
  ctx,
  { x, y, displacement, velocity, k, damping, meterToPixel }
) => {
  ctx.save();

  const vectorScale = 20;

  // Spring force vector (pointing toward equilibrium)
  const springForce = -k * displacement;
  const springVectorLength = springForce * vectorScale;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + springVectorLength);
  ctx.strokeStyle = "#4ECDC4";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Arrowhead
  const springAngle = springForce > 0 ? Math.PI / 2 : -Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + springVectorLength);
  ctx.lineTo(x - 8, y + springVectorLength - Math.sign(springForce) * 12);
  ctx.lineTo(x + 8, y + springVectorLength - Math.sign(springForce) * 12);
  ctx.closePath();
  ctx.fillStyle = "#4ECDC4";
  ctx.fill();

  // Label
  ctx.fillStyle = "#4ECDC4";
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  ctx.fillText(
    `Fs = ${springForce.toFixed(1)}N`,
    x + 40,
    y + springVectorLength / 2
  );

  // Velocity vector
  const velocityVectorLength = velocity * meterToPixel * 0.5;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + velocityVectorLength, y);
  ctx.strokeStyle = "#95E1D3";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Arrowhead
  if (Math.abs(velocityVectorLength) > 5) {
    ctx.beginPath();
    ctx.moveTo(x + velocityVectorLength, y);
    ctx.lineTo(x + velocityVectorLength - Math.sign(velocity) * 12, y - 8);
    ctx.lineTo(x + velocityVectorLength - Math.sign(velocity) * 12, y + 8);
    ctx.closePath();
    ctx.fillStyle = "#95E1D3";
    ctx.fill();

    // Label
    ctx.fillStyle = "#95E1D3";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `v = ${velocity.toFixed(2)}m/s`,
      x + velocityVectorLength / 2,
      y - 20
    );
  }

  ctx.restore();
};

export const drawSpringTrail = (
  ctx,
  { trail, startX, startY, graphWidth, graphHeight, meterToPixel }
) => {
  if (trail.length < 2) return;

  ctx.save();

  // ===== BACKGROUND =====
  const bgGradient = ctx.createLinearGradient(
    startX,
    startY,
    startX,
    startY + graphHeight
  );
  bgGradient.addColorStop(0, "rgba(20, 28, 60, 0.8)");
  bgGradient.addColorStop(1, "rgba(30, 35, 70, 0.8)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(startX, startY, graphWidth, graphHeight);

  // Glassmorphism border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, graphWidth, graphHeight);

  // Inner glow
  ctx.strokeStyle = "rgba(78, 205, 196, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(startX + 1, startY + 1, graphWidth - 2, graphHeight - 2);

  // ===== TITLE =====
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(78, 205, 196, 0.5)";
  ctx.shadowBlur = 5;
  ctx.fillText("Position vs Time", startX + graphWidth / 2, startY + 20);
  ctx.shadowBlur = 0;

  // ===== GRAPH AREA =====
  const padding = 35;
  const gx = startX + padding;
  const gy = startY + 40;
  const gw = graphWidth - padding * 2;
  const gh = graphHeight - 60;

  // Find scaling
  const maxDisp = Math.max(...trail.map((p) => Math.abs(p.y)), 1);

  // ===== GRID =====
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 0; i <= 6; i++) {
    const y = gy + (i / 6) * gh;
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx + gw, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let i = 0; i <= 5; i++) {
    const x = gx + (i / 5) * gw;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy + gh);
    ctx.stroke();
  }

  // ===== ZERO LINE =====
  const zeroY = gy + gh / 2;
  ctx.strokeStyle = "rgba(78, 205, 196, 0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(gx, zeroY);
  ctx.lineTo(gx + gw, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  // ===== Y-AXIS LABELS =====
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "11px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  [
    { y: gy, text: `+${maxDisp.toFixed(1)}` },
    { y: zeroY, text: "0" },
    { y: gy + gh, text: `-${maxDisp.toFixed(1)}` },
  ].forEach((label) => {
    ctx.fillText(label.text, gx - 8, label.y);
  });

  // Y-axis unit
  ctx.save();
  ctx.translate(gx - 25, gy + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.font = "10px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText("Position (m)", 0, 0);
  ctx.restore();

  // ===== DRAW WAVE =====
  if (trail.length > 1) {
    // Create gradient for wave
    const waveGradient = ctx.createLinearGradient(gx, gy, gx + gw, gy);
    waveGradient.addColorStop(0, "#4ECDC4");
    waveGradient.addColorStop(0.5, "#FFB74D");
    waveGradient.addColorStop(1, "#FF6B6B");

    // Draw filled area under curve
    ctx.beginPath();
    trail.forEach((point, i) => {
      const x = gx + (i / (trail.length - 1)) * gw;
      const norm = maxDisp > 0 ? point.y / maxDisp : 0;
      const y = zeroY - norm * (gh / 2 - 5);

      if (i === 0) {
        ctx.moveTo(x, zeroY);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(gx + gw, zeroY);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(gx, gy, gx, gy + gh);
    fillGradient.addColorStop(0, "rgba(78, 205, 196, 0.2)");
    fillGradient.addColorStop(0.5, "rgba(255, 183, 77, 0.15)");
    fillGradient.addColorStop(1, "rgba(255, 107, 107, 0.2)");
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Draw the line
    ctx.beginPath();
    trail.forEach((point, i) => {
      const x = gx + (i / (trail.length - 1)) * gw;
      const norm = maxDisp > 0 ? point.y / maxDisp : 0;
      const y = zeroY - norm * (gh / 2 - 5);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = waveGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#FFB74D";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current position marker
    const last = trail[trail.length - 1];
    const lastX = gx + gw;
    const lastNorm = maxDisp > 0 ? last.y / maxDisp : 0;
    const lastY = zeroY - lastNorm * (gh / 2 - 5);

    // Outer glow
    ctx.beginPath();
    ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 107, 107, 0.3)";
    ctx.fill();

    // Main dot
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B6B";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ===== TIME LABEL =====
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Time →", startX + graphWidth / 2, startY + graphHeight - 10);

  ctx.restore();
};

export const drawSpringInfo = (ctx, { springData, damping, x, y }) => {
  ctx.save();

  const panelWidth = 280;
  const panelHeight = 200;

  // Panel background
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(x, y, panelWidth, panelHeight);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  // Title
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "left";
  ctx.fillText("System Information", x + 10, y + 25);

  // Draw separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 35);
  ctx.lineTo(x + panelWidth - 10, y + 35);
  ctx.stroke();

  // Calculate physics values
  const omega = Math.sqrt(springData.k / springData.mass);
  const period = (2 * Math.PI) / omega;
  const frequency = 1 / period;
  const kineticEnergy =
    0.5 * springData.mass * Math.pow(springData.velocity, 2);
  const potentialEnergy =
    0.5 * springData.k * Math.pow(springData.displacement, 2);
  const totalEnergy = kineticEnergy + potentialEnergy;
  const criticalDamping = 2 * Math.sqrt(springData.k * springData.mass);
  const dampingRatio = damping / criticalDamping;

  // Determine damping type
  let dampingType = "Undamped";
  if (damping > 0) {
    if (dampingRatio < 1) {
      dampingType = "Underdamped";
    } else if (dampingRatio === 1) {
      dampingType = "Critically Damped";
    } else {
      dampingType = "Overdamped";
    }
  }

  // Data rows
  const data = [
    {
      label: "Spring Constant (k)",
      value: `${springData.k.toFixed(1)} N/m`,
      color: "#4ECDC4",
    },
    {
      label: "Mass (m)",
      value: `${springData.mass.toFixed(2)} kg`,
      color: "#FF6B6B",
    },
    {
      label: "Displacement (x)",
      value: `${springData.displacement.toFixed(2)} m`,
      color: "#FFB74D",
    },
    {
      label: "Velocity (v)",
      value: `${springData.velocity.toFixed(2)} m/s`,
      color: "#95E1D3",
    },
    { label: "Period (T)", value: `${period.toFixed(2)} s`, color: "#667eea" },
    {
      label: "Frequency (f)",
      value: `${frequency.toFixed(2)} Hz`,
      color: "#764ba2",
    },
    {
      label: "Kinetic Energy",
      value: `${kineticEnergy.toFixed(2)} J`,
      color: "#95E1D3",
    },
    {
      label: "Potential Energy",
      value: `${potentialEnergy.toFixed(2)} J`,
      color: "#4ECDC4",
    },
    {
      label: "Total Energy",
      value: `${totalEnergy.toFixed(2)} J`,
      color: "#FFB74D",
    },
    { label: "Damping Type", value: dampingType, color: "#764ba2" },
  ];

  let currentY = y + 50;
  const lineHeight = 15;

  ctx.font = "12px Arial";

  data.forEach((item) => {
    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "left";
    ctx.fillText(item.label, x + 10, currentY);

    // Value
    ctx.fillStyle = item.color;
    ctx.textAlign = "right";
    ctx.fillText(item.value, x + panelWidth - 10, currentY);

    currentY += lineHeight;
  });

  ctx.restore();
};
// ===== SEESAW DRAWING FUNCTIONS =====

export const drawSeesawBackground = (ctx, width, height) => {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "rgba(20, 28, 60, 1)");
  bgGradient.addColorStop(1, "rgba(30, 35, 70, 1)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Draw ground
  ctx.fillStyle = "rgba(139, 92, 246, 0.1)";
  ctx.fillRect(0, height / 2 + 100, width, height / 2 - 100);

  // Ground line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2 + 100);
  ctx.lineTo(width, height / 2 + 100);
  ctx.stroke();
};

export const drawFulcrum = (ctx, position, angle) => {
  ctx.save();

  const { x, y } = position;
  const baseWidth = 80;
  const height = 60;

  // Draw shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + 65, baseWidth / 2 + 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw base (trapezoid)
  ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x - baseWidth / 2, y + 60);
  ctx.lineTo(x + baseWidth / 2, y + 60);
  ctx.lineTo(x + baseWidth / 3, y);
  ctx.lineTo(x - baseWidth / 3, y);
  ctx.closePath();

  // Gradient fill
  const fulcrumGradient = ctx.createLinearGradient(
    x - baseWidth / 2,
    y,
    x + baseWidth / 2,
    y
  );
  fulcrumGradient.addColorStop(0, "#667eea");
  fulcrumGradient.addColorStop(0.5, "#764ba2");
  fulcrumGradient.addColorStop(1, "#667eea");
  ctx.fillStyle = fulcrumGradient;
  ctx.fill();
  ctx.stroke();

  // Draw pivot point (triangle top)
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.lineTo(x, y - 15);
  ctx.closePath();

  const pivotGradient = ctx.createLinearGradient(x - 20, y - 15, x + 20, y);
  pivotGradient.addColorStop(0, "#FFB74D");
  pivotGradient.addColorStop(1, "#FF6B6B");
  ctx.fillStyle = pivotGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw decorative lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const lineY = y + (i * height) / 4;
    const lineWidth = baseWidth - i * 10;
    ctx.beginPath();
    ctx.moveTo(x - lineWidth / 2, lineY);
    ctx.lineTo(x + lineWidth / 2, lineY);
    ctx.stroke();
  }

  // Glow effect
  ctx.shadowColor = "#764ba2";
  ctx.shadowBlur = 20;
  ctx.strokeStyle = "rgba(118, 75, 162, 0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
};

export const drawSeesaw = (
  ctx,
  { fulcrum, leftLength, rightLength, angle, thickness, meterToPixel }
) => {
  ctx.save();

  const { x, y } = fulcrum;
  const totalLength = (leftLength + rightLength) * meterToPixel;
  const plankHeight = thickness * meterToPixel;

  // Translate to fulcrum and rotate
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Draw shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(
    -leftLength * meterToPixel - 10,
    plankHeight / 2 + 5,
    totalLength + 20,
    plankHeight + 5
  );

  // Draw plank with gradient
  const plankGradient = ctx.createLinearGradient(
    -leftLength * meterToPixel,
    -plankHeight / 2,
    rightLength * meterToPixel,
    plankHeight / 2
  );
  plankGradient.addColorStop(0, "#8B5CF6");
  plankGradient.addColorStop(0.5, "#A78BFA");
  plankGradient.addColorStop(1, "#8B5CF6");

  ctx.fillStyle = plankGradient;
  ctx.fillRect(
    -leftLength * meterToPixel,
    -plankHeight / 2,
    totalLength,
    plankHeight
  );

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    -leftLength * meterToPixel,
    -plankHeight / 2,
    totalLength,
    plankHeight
  );

  // Draw wood texture lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  for (
    let i = -leftLength * meterToPixel;
    i < rightLength * meterToPixel;
    i += 40
  ) {
    ctx.beginPath();
    ctx.moveTo(i, -plankHeight / 2);
    ctx.lineTo(i, plankHeight / 2);
    ctx.stroke();
  }

  // Draw center marker
  ctx.fillStyle = "#FFB74D";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw measurement markers
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Left marker
  ctx.fillText(`${leftLength}m`, (-leftLength * meterToPixel) / 2, 0);

  // Right marker
  ctx.fillText(`${rightLength}m`, (rightLength * meterToPixel) / 2, 0);

  // Draw end caps
  const capWidth = 15;
  [-leftLength * meterToPixel, rightLength * meterToPixel].forEach((endX) => {
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(
      endX - capWidth / 2,
      -plankHeight / 2 - 5,
      capWidth,
      plankHeight + 10
    );
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      endX - capWidth / 2,
      -plankHeight / 2 - 5,
      capWidth,
      plankHeight + 10
    );
  });

  ctx.restore();
};

// ✅ FIXED: drawWeightBox handles colors safely without appending "dd"
export const drawWeightBox = (
  ctx,
  { x, y, mass, color, isSelected, isDragging, angle, isAvailable }
) => {
  const size = Math.min(50, 25 + mass * 1.2);

  ctx.save();
  ctx.translate(x, y);

  // Only rotate if it's on the plank (not in the available palette)
  if (!isAvailable) {
    ctx.rotate(angle);
  }

  // Draw Box
  const gradient = ctx.createLinearGradient(
    -size / 2,
    -size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, color);

  // 🔴 THE FIX: Removed the + "dd" string concatenation
  // If you need transparency, you'd need a complex color converter,
  // but for now, using the solid color prevents the crash.
  gradient.addColorStop(1, color);

  ctx.fillStyle = gradient;

  // Shadow logic
  if (isDragging) {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 10;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
  }

  ctx.beginPath();
  // Draw rounded rect centered at (0,0) relative to translation
  // We offset Y by -size/2 so the bottom of the box sits on the pivot point
  if (ctx.roundRect) {
    ctx.roundRect(-size / 2, -size, size, size, 4);
  } else {
    ctx.rect(-size / 2, -size, size, size); // Fallback for older browsers
  }
  ctx.fill();

  // Selection Glow
  if (isSelected) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Mass Text
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(mass, 0, -size / 2);

  ctx.restore();
};

export const drawTorqueVectors = (
  ctx,
  { fulcrum, weights, angle, meterToPixel, gravity }
) => {
  ctx.save();

  weights.forEach((weight) => {
    if (!weight.active) return;

    const { x: fx, y: fy } = fulcrum;
    const distance = weight.position * meterToPixel;

    // Position on plank center
    const plankCenterX = fx + distance * Math.cos(angle);
    const plankCenterY = fy + distance * Math.sin(angle);

    // Weight position (same calculation as getWeightScreenPosition)
    const weightSize = Math.min(50, 25 + weight.mass * 1.2);
    const plankThickness = 0.15 * meterToPixel;
    const gap = 3;
    const totalOffset = plankThickness / 2 + weightSize / 2 + gap;

    // SAME FIX: Perpendicular upward
    const offsetX = totalOffset * Math.sin(angle);
    const offsetY = -totalOffset * Math.cos(angle);

    const weightX = plankCenterX + offsetX;
    const weightY = plankCenterY + offsetY;

    // Force magnitude
    const force = weight.mass * gravity;
    const forceScale = 0.5;
    const forceVectorLength = force * forceScale;

    // Draw force vector (downward) - RED
    ctx.beginPath();
    ctx.moveTo(weightX, weightY);
    ctx.lineTo(weightX, weightY + forceVectorLength);
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(weightX, weightY + forceVectorLength);
    ctx.lineTo(weightX - 6, weightY + forceVectorLength - 10);
    ctx.lineTo(weightX + 6, weightY + forceVectorLength - 10);
    ctx.closePath();
    ctx.fillStyle = "#FF6B6B";
    ctx.fill();

    // Force label
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `F=${force.toFixed(0)}N`,
      weightX,
      weightY + forceVectorLength + 15
    );

    // Draw moment arm (from fulcrum to weight center)
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(weightX, weightY);
    ctx.strokeStyle = "#4ECDC4";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label
    ctx.fillStyle = "#4ECDC4";
    ctx.font = "bold 10px Arial";
    const midX = (fx + weightX) / 2;
    const midY = (fy + weightY) / 2;
    ctx.fillText(`r=${Math.abs(weight.position).toFixed(1)}m`, midX, midY - 5);

    // Torque value near weight
    const torque = Math.abs(weight.position) * force;
    ctx.fillStyle = "#FFB74D";
    ctx.font = "bold 11px Arial";
    ctx.fillText(`τ=${torque.toFixed(0)} N⋅m`, weightX, weightY - 35);
  });

  // Draw rotation indicator at fulcrum
  const netTorque = weights.reduce((sum, w) => {
    if (!w.active) return sum;
    return sum + w.position * w.mass * gravity;
  }, 0);

  if (Math.abs(netTorque) > 5) {
    const arcRadius = 50;
    const direction = netTorque > 0 ? 1 : -1;

    ctx.beginPath();
    ctx.arc(fulcrum.x, fulcrum.y, arcRadius, -0.5 * direction, 0.5 * direction);
    ctx.strokeStyle = "#FFB74D";
    ctx.lineWidth = 3;
    ctx.stroke();

    const arrowAngle = 0.5 * direction;
    const arrowX = fulcrum.x + arcRadius * Math.cos(arrowAngle);
    const arrowY = fulcrum.y + arcRadius * Math.sin(arrowAngle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 10 * direction, arrowY - 8);
    ctx.lineTo(arrowX - 10 * direction, arrowY + 8);
    ctx.closePath();
    ctx.fillStyle = "#FFB74D";
    ctx.fill();

    ctx.fillStyle = "#FFB74D";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Net τ=${Math.abs(netTorque).toFixed(0)} N⋅m`,
      fulcrum.x,
      fulcrum.y - 70
    );
  }

  ctx.restore();
};

export const drawSeesawInfo = (ctx, { seesawData, physics, weights, x, y }) => {
  ctx.save();

  const panelWidth = 300;
  const panelHeight = 240;

  // Panel background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(x, y, panelWidth, panelHeight);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  // Title
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Seesaw Information", x + 10, y + 25);

  // Separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 35);
  ctx.lineTo(x + panelWidth - 10, y + 35);
  ctx.stroke();

  // Calculate additional physics
  const angleInDegrees = (seesawData.angle * 180) / Math.PI;
  const totalMass =
    weights.reduce((sum, w) => sum + (w.active ? w.mass : 0), 0) +
    seesawData.plankMass;
  const leftWeights = weights.filter((w) => w.active && w.position < 0).length;
  const rightWeights = weights.filter(
    (w) => w.active && w.position >= 0
  ).length;

  // Data rows
  const data = [
    {
      label: "Angle",
      value: `${angleInDegrees.toFixed(1)}°`,
      color: "#FFB74D",
    },
    {
      label: "Angular Velocity",
      value: `${seesawData.angularVelocity.toFixed(3)} rad/s`,
      color: "#95E1D3",
    },
    {
      label: "Net Torque",
      value: `${physics.netTorque.toFixed(1)} N⋅m`,
      color: "#FF6B6B",
    },
    {
      label: "Moment of Inertia",
      value: `${physics.totalMomentOfInertia.toFixed(1)} kg⋅m²`,
      color: "#4ECDC4",
    },
    {
      label: "Total Mass",
      value: `${totalMass.toFixed(1)} kg`,
      color: "#667eea",
    },
    {
      label: "Left Arm",
      value: `${seesawData.leftArmLength.toFixed(1)} m`,
      color: "#FF6B6B",
    },
    {
      label: "Right Arm",
      value: `${seesawData.rightArmLength.toFixed(1)} m`,
      color: "#4ECDC4",
    },
    {
      label: "Weights (L/R)",
      value: `${leftWeights} / ${rightWeights}`,
      color: "#A29BFE",
    },
  ];

  let currentY = y + 55;
  const lineHeight = 22;

  ctx.font = "12px Arial";

  data.forEach((item) => {
    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "left";
    ctx.fillText(item.label, x + 10, currentY);

    // Value
    ctx.fillStyle = item.color;
    ctx.textAlign = "right";
    ctx.fillText(item.value, x + panelWidth - 10, currentY);

    currentY += lineHeight;
  });

  ctx.restore();
};
