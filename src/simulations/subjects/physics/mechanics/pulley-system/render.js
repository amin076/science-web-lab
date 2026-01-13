import { clamp, GRID_STEP } from "./constants";

export const drawBeam = (ctx, w) => {
  const beamHeight = 40;
  const grad = ctx.createLinearGradient(0, 0, 0, beamHeight);
  grad.addColorStop(0, "#8B5A2B");
  grad.addColorStop(0.5, "#A06B36");
  grad.addColorStop(1, "#6F421B");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, beamHeight);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, beamHeight, w, 4);

  // Decorative wood grain
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 2;
  for (let i = 0; i < w; i += 100) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 50, 20, i - 20, 30, i + 10, 40);
    ctx.stroke();
  }
};

/**
 * Draws a centered table with legs.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cw Canvas Width
 * @param {number} ch Canvas Height
 * @param {number} tableHeight The height of the table surface from the BOTTOM of the canvas
 */
export const drawTable = (ctx, cw, ch, tableHeight) => {
  const tableW = 260; // Width of the table top
  const topThickness = 25;

  // Calculate top-left of the table surface
  const surfY = ch - tableHeight;
  const surfX = (cw - tableW) / 2;

  // Draw Legs (Back legs darker)
  ctx.fillStyle = "#3E2723";
  const legW = 18;
  const legInset = 30;
  // Back Left
  ctx.fillRect(
    surfX + legInset + 10,
    surfY + topThickness,
    legW,
    tableHeight - topThickness - 10
  );
  // Back Right
  ctx.fillRect(
    surfX + tableW - legInset - legW - 10,
    surfY + topThickness,
    legW,
    tableHeight - topThickness - 10
  );

  // Draw Legs (Front legs)
  ctx.fillStyle = "#5D4037";
  // Front Left
  ctx.fillRect(
    surfX + legInset,
    surfY + topThickness,
    legW,
    tableHeight - topThickness
  );
  // Front Right
  ctx.fillRect(
    surfX + tableW - legInset - legW,
    surfY + topThickness,
    legW,
    tableHeight - topThickness
  );

  // Draw Table Top
  const gradTop = ctx.createLinearGradient(0, surfY, 0, surfY + topThickness);
  gradTop.addColorStop(0, "#8D6E63");
  gradTop.addColorStop(1, "#4E342E");

  // Shadow under the top
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(surfX + 5, surfY + topThickness, tableW - 10, 5);

  ctx.fillStyle = gradTop;
  ctx.fillRect(surfX, surfY, tableW, topThickness);

  // Edge detail
  ctx.fillStyle = "#3E2723";
  ctx.fillRect(surfX, surfY + topThickness - 2, tableW, 2);

  // Label on the table
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TABLE", cw / 2, surfY + topThickness - 8);
};

export const drawRopePath = (ctx, pts, dashOffset) => {
  if (!pts || pts.length < 2) return;

  // Shadow
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x + 2, pts[0].y + 2);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x + 2, pts[i].y + 2);
  ctx.stroke();

  // Main Rope
  ctx.strokeStyle = "#D4A373";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // Texture Animation
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -dashOffset; // Animate movement
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawRealPulley = (ctx, x, y, r, type) => {
  ctx.save();
  ctx.translate(x, y);

  const bracketH = r + 15;
  const bracketW = r + 8;
  ctx.fillStyle = "#52525B";
  ctx.beginPath();
  if (type === "fixed") {
    ctx.roundRect(-bracketW / 2, -bracketH, bracketW, bracketH + 5, 4);
  } else {
    ctx.roundRect(-bracketW / 2, -5, bracketW, bracketH + 5, 4);
  }
  ctx.fill();

  const grad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r);
  grad.addColorStop(0, "#E4E4E7");
  grad.addColorStop(0.8, "#A1A1AA");
  grad.addColorStop(1, "#71717A");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3F3F46";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#18181B";
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(
      Math.cos(ang) * r * 0.6,
      Math.sin(ang) * r * 0.6,
      r * 0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = "#3F3F46";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawRealLoad = (ctx, x, y, mass) => {
  ctx.save();
  ctx.translate(x, y); // y is the top attachment point
  const w = 80;
  const h = 60; // This height MUST match the calc in PulleySystemSimulation

  // Load body
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, h);
  grad.addColorStop(0, "#475569");
  grad.addColorStop(1, "#1E293B");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, 0, w, h, 8);
  ctx.fill();

  // Text
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${mass.toFixed(0)} kg`, 0, h / 2 + 5);
  ctx.restore();
};

export const drawArrow = (ctx, x1, y1, x2, y2, color, w = 3, label = "") => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const ah = 12;
  const aw = 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * ah - uy * aw, y2 - uy * ah + ux * aw);
  ctx.lineTo(x2 - ux * ah + uy * aw, y2 - uy * ah - ux * aw);
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(label, x2 + 10, y2);
  }
};

export const drawForceArrow = (ctx, x, y, len, color, label) => {
  if (Math.abs(len) < 1) return;
  const dir = Math.sign(len);
  const vLen = clamp(Math.abs(len) * 0.4, 40, 120) * dir;
  drawArrow(ctx, x, y, x, y + vLen, color, 4, label);
};

export const renderScene = (
  ctx,
  width,
  height,
  params,
  simState,
  forces,
  geometry,
  system,
  ropeOffset,
  tableHeight
) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw Environment
  drawBeam(ctx, width);
  drawTable(ctx, width, height, tableHeight);

  drawRopePath(ctx, system.pts, ropeOffset);

  if (system.anchor) {
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(
      geometry.xToPx(system.anchor.x),
      geometry.yToPx(system.anchor.y),
      6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  system.fixed.forEach((pl) =>
    drawRealPulley(
      ctx,
      geometry.xToPx(pl.x),
      geometry.yToPx(pl.y),
      geometry.pulleyRPx,
      "fixed"
    )
  );
  system.moving.forEach((pl) =>
    drawRealPulley(
      ctx,
      geometry.xToPx(pl.x),
      geometry.yToPx(pl.y),
      geometry.pulleyRPx,
      "moving"
    )
  );

  if (system.moving.length > 1) {
    const xs = system.moving.map((m) => geometry.xToPx(m.x));
    const minX = Math.min(...xs) - 10;
    const maxX = Math.max(...xs) + 10;
    const yBar = geometry.yToPx(system.moving[0].y) + geometry.pulleyRPx + 20;
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.roundRect(minX, yBar - 5, maxX - minX, 10, 5);
    ctx.fill();
    system.moving.forEach((m) => {
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(geometry.xToPx(m.x), geometry.yToPx(m.y));
      ctx.lineTo(geometry.xToPx(m.x), yBar);
      ctx.stroke();
    });
  }

  const hx = geometry.xToPx(system.loadHook.x);
  const hy = geometry.yToPx(system.loadHook.y);
  drawRealLoad(ctx, hx, hy, params.loadMass);

  const ex = geometry.xToPx(system.effort.x);
  const ey = geometry.yToPx(system.effort.y);
  drawArrow(ctx, ex, ey - 60, ex, ey, "#fbbf24", 4, `${forces.T.toFixed(0)} N`);

  if (params.showForces) {
    drawForceArrow(
      ctx,
      hx,
      hy + 60,
      forces.W,
      "#ef4444",
      `W=${forces.W.toFixed(0)}N`
    );
    const liftY = geometry.yToPx(
      system.moving.length > 0 ? system.moving[0].y : simState.y
    );
    drawForceArrow(
      ctx,
      hx,
      liftY - 40,
      -forces.F_up,
      "#22c55e",
      `Lift=${forces.F_up.toFixed(0)}N`
    );
  }
};
