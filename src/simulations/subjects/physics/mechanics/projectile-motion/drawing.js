// src/simulations/subjects/physics/mechanics/projectile-motion/utils/drawing.js

export const worldToScreen = (wx, wy, view, canvasHeight) => {
  return {
    x: wx * view.scale + view.x,
    y: canvasHeight - (wy * view.scale + view.y)
  };
};

// --- 1. DAYLIGHT ENVIRONMENT ---
export const drawEnvironment = (ctx, view, width, height) => {
  const groundY = height - (0 * view.scale + view.y);

  // A. REALISTIC SKY (Vertical Gradient)
  // From deep zenith blue to horizon haze
  const skyGrad = ctx.createLinearGradient(0, 0, 0, Math.max(0, groundY));
  skyGrad.addColorStop(0, "#2980b9"); // Deep Sky Blue
  skyGrad.addColorStop(0.6, "#6dd5fa"); // Light Blue
  skyGrad.addColorStop(1, "#ffffff"); // Atmospheric Haze at horizon
  
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height); // Fill entire BG first

  // B. CLOUDS (Subtle Depth)
  // Optional: Add very faint distinct cloud shapes if desired, 
  // but a clean gradient is more "lab-like".

  // C. INFINITE FLOOR (Test Grid)
  if (groundY < height) {
    // 1. Floor Base (Concrete/Asphalt Grey)
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
    floorGrad.addColorStop(0, "#9ea7b0"); // Horizon Grey (Distance)
    floorGrad.addColorStop(1, "#7f8c8d"); // Foreground Grey
    
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // 2. Perspective Grid
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, width, height - groundY);
    ctx.clip();

    const gridSize = 10 * view.scale; // 10m minor
    const majorGrid = 50 * view.scale; // 50m major
    const offsetX = view.x % gridSize;
    const offsetX_maj = view.x % majorGrid;

    // Minor Lines (Faint White)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSize) {
       // Angled lines for "infinite" feel if we wanted 3D, 
       // but for 2D side-scroller, vertical lines represent X-distance.
       ctx.moveTo(x, groundY);
       ctx.lineTo(x, height);
    }
    ctx.stroke();

    // Major Lines (Stronger White)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "center";
    
    ctx.beginPath();
    for (let x = offsetX_maj; x < width; x += majorGrid) {
       ctx.moveTo(x, groundY);
       ctx.lineTo(x, height);
       
       // Distance Markers
       const wx = Math.round((x - view.x) / view.scale);
       ctx.fillText(`${wx}m`, x, groundY + 20);
    }
    ctx.stroke();

    // 3. Horizon Line (Crisp Edge)
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    
    ctx.restore();
  }

  // D. SKY GRID (Transparent reference)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, Math.max(0, groundY));
  ctx.clip();
  
  const skyGridSize = 50 * view.scale;
  const offY = view.y % skyGridSize;
  
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  // Only horizontal lines for altitude ref
  ctx.beginPath();
  for (let y = offY; y < height; y += skyGridSize) {
    if (y < groundY) {
       ctx.moveTo(0, y); 
       ctx.lineTo(width, y);
       
       // Altitude Text
       const wy = Math.round((groundY - y) / view.scale);
       if (wy > 0) {
         ctx.fillStyle = "rgba(0,0,0,0.3)";
         ctx.fillText(`${wy}m`, 20, y + 4);
       }
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

// --- 2. OBJECTS (Daylight Shading) ---
export const drawObject = (ctx, obj, view, canvasHeight, vectorMode) => {
  const pos = worldToScreen(obj.x, obj.y, view, canvasHeight);
  // Optimization
  if (pos.x < -200 || pos.x > ctx.canvas.width + 200 || pos.y < -200 || pos.y > ctx.canvas.height + 200) return;

  if (obj.type === "ball") {
    drawDaylightBall(ctx, pos, obj, view.scale);
  } else if (obj.type === "car") {
    drawDaylightCar(ctx, pos, obj, view.scale);
  }

  // Vectors (Darker colors for visibility on light BG)
  const vScale = 0.5;
  if (vectorMode.x) drawArrow(ctx, pos.x, pos.y, pos.x + obj.vx * view.scale * vScale, pos.y, "#27ae60"); // Dark Green
  if (vectorMode.y) drawArrow(ctx, pos.x, pos.y, pos.x, pos.y - obj.vy * view.scale * vScale, "#2980b9"); // Dark Blue
  if (vectorMode.v) drawArrow(ctx, pos.x, pos.y, pos.x + obj.vx * view.scale * vScale, pos.y - obj.vy * view.scale * vScale, "#d35400"); // Burnt Orange
};

const drawDaylightBall = (ctx, pos, obj, scale) => {
  const r = Math.max(4, obj.radius * scale);
  
  // 1. Drop Shadow (Projected on ground or simple offset?)
  // Simple offset shadow for 2D side view looks like depth
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.arc(pos.x + r*0.2, pos.y + r*0.2, r, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. Ball Sphere (3D Shading)
  // Light coming from Top-Left
  const grad = ctx.createRadialGradient(pos.x - r*0.3, pos.y - r*0.3, r*0.1, pos.x, pos.y, r);
  grad.addColorStop(0, "#ffffff"); // Specular highlight
  grad.addColorStop(0.3, obj.color); // Main color
  grad.addColorStop(1, "#1a1a1a"); // Shadow side
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();
  
  // 3. Rim Light (optional polish)
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
};

const drawDaylightCar = (ctx, pos, obj, scale) => {
  const w = obj.width * scale;
  const h = obj.height * scale;
  const { x, y } = pos;
  const bottomY = y; 

  ctx.save();

  // 1. Realistic Shadow (Blurry black oval on ground)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.filter = "blur(4px)";
  ctx.beginPath();
  ctx.ellipse(x, bottomY + 2, w * 0.55, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";

  // 2. Wheels
  const wheelRadius = h * 0.38;
  const wheelY = bottomY - wheelRadius * 0.9;
  const wheelOffset = w * 0.32;

  const drawWheel = (wx, wy) => {
    // Tire Rubber
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath(); ctx.arc(wx, wy, wheelRadius, 0, Math.PI * 2); ctx.fill();
    // Shiny Rim
    ctx.fillStyle = "#bdc3c7"; // Silver
    ctx.beginPath(); ctx.arc(wx, wy, wheelRadius * 0.6, 0, Math.PI * 2); ctx.fill();
    // Lug nuts
    ctx.fillStyle = "#7f8c8d";
    ctx.beginPath(); ctx.arc(wx, wy, wheelRadius * 0.15, 0, Math.PI * 2); ctx.fill();
  };
  drawWheel(x - wheelOffset, wheelY);
  drawWheel(x + wheelOffset, wheelY);

  // 3. Car Body (Sports Shape)
  const bodyBottom = bottomY - h * 0.25;
  
  // Gradient Paint (Metallic look)
  const paintGrad = ctx.createLinearGradient(x, bodyBottom - h, x, bodyBottom);
  paintGrad.addColorStop(0, "#ff6b6b"); // Highlight
  paintGrad.addColorStop(0.5, "#ee5253"); // Mid
  paintGrad.addColorStop(1, "#b33939"); // Shadow
  
  if (obj.color !== "#FF2E63") { // Adapt if user changes color (or default red)
     // Just use solid if not default, or calculate gradient logic
     ctx.fillStyle = obj.color;
  } else {
     ctx.fillStyle = paintGrad;
  }
  
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, bodyBottom);
  ctx.lineTo(x + w * 0.45, bodyBottom);
  // Nose
  ctx.quadraticCurveTo(x + w * 0.5, bodyBottom - h * 0.1, x + w * 0.5, bodyBottom - h * 0.3);
  // Hood
  ctx.lineTo(x + w * 0.2, bodyBottom - h * 0.45);
  // Windshield
  ctx.lineTo(x + w * 0.05, bodyBottom - h * 0.75);
  // Roof
  ctx.lineTo(x - w * 0.2, bodyBottom - h * 0.75);
  // Rear Window
  ctx.lineTo(x - w * 0.45, bodyBottom - h * 0.5);
  // Trunk
  ctx.lineTo(x - w * 0.5, bodyBottom - h * 0.3);
  ctx.closePath();
  ctx.fill();

  // 4. Windows (Dark Blue Tint with reflection)
  ctx.fillStyle = "#2c3e50";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, bodyBottom - h * 0.47);
  ctx.lineTo(x + w * 0.05, bodyBottom - h * 0.72);
  ctx.lineTo(x - w * 0.2, bodyBottom - h * 0.72);
  ctx.lineTo(x - w * 0.42, bodyBottom - h * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // Reflection on window
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, bodyBottom - h * 0.47);
  ctx.lineTo(x, bodyBottom - h * 0.72);
  ctx.lineTo(x - w * 0.1, bodyBottom - h * 0.72);
  ctx.lineTo(x - w * 0.05, bodyBottom - h * 0.47);
  ctx.fill();

  ctx.restore();
};

const drawArrow = (ctx, x1, y1, x2, y2, color) => {
  const headLen = 8;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2-x1, y2-y1);
  if(len < 5) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.fill();
};

export const drawTrajectory = (ctx, trail, view, height) => {
  if (trail.length < 2) return;
  
  ctx.beginPath();
  ctx.strokeStyle = "#333"; // Dark grey trail for visibility on light BG
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  const start = worldToScreen(trail[0].x, trail[0].y, view, height);
  ctx.moveTo(start.x, start.y);
  
  const step = Math.max(1, Math.ceil(trail.length / 300)); 
  for (let i = 1; i < trail.length; i += step) {
     const pt = worldToScreen(trail[i].x, trail[i].y, view, height);
     ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
};

// --- 4. HUD (Dark Glass - High Contrast) ---
export const drawModernHUD = (ctx, obj, view, canvasHeight) => {
  const pos = worldToScreen(obj.x, obj.y, view, canvasHeight);
  const width = 180;
  const height = 120;
  const padding = 15;
  const borderRadius = 8;
  const x = pos.x - width / 2; 
  const y = pos.y - 150; 

  // Connector
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; // Dark connector
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(pos.x, y + height);
  ctx.stroke();
  
  // Anchor Dot
  ctx.fillStyle = "#333";
  ctx.beginPath(); ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  
  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  // Background (Dark Semi-Transparent for contrast against sky)
  ctx.fillStyle = "rgba(30, 30, 35, 0.85)"; 
  if (ctx.roundRect) {
    ctx.beginPath(); ctx.roundRect(x, y, width, height, borderRadius); ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }
  ctx.shadowBlur = 0;

  // Border (Subtle white rim)
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Accent Color Bar
  ctx.fillStyle = obj.color;
  if (ctx.roundRect) {
    ctx.beginPath(); ctx.roundRect(x + 4, y + 15, 3, height - 30, 2); ctx.fill();
  }
  ctx.restore();

  // Text
  const textX = x + padding + 8;
  const valueX = x + width - padding;
  let textY = y + 25;

  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px 'Inter', system-ui, sans-serif";
  ctx.fillText(obj.id.toUpperCase(), textX, textY);
  
  textY += 10;
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath(); ctx.moveTo(textX, textY); ctx.lineTo(valueX, textY); ctx.stroke();

  textY += 20;
  ctx.font = "11px 'Inter', system-ui, sans-serif";
  const rowHeight = 18;

  const drawRow = (label, value) => {
    ctx.fillStyle = "rgba(255,255,255,0.7)"; 
    ctx.textAlign = "left";
    ctx.fillText(label, textX, textY);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    ctx.fillText(value, valueX, textY);
    
    textY += rowHeight;
  };

  const vTotal = Math.hypot(obj.vx, obj.vy).toFixed(1);
  const KE = (0.5 * obj.mass * (obj.vx**2 + obj.vy**2)).toFixed(0);
  const PE = (obj.mass * 9.8 * obj.y).toFixed(0);

  drawRow("Position", `(${obj.x.toFixed(1)}, ${obj.y.toFixed(1)}) m`);
  drawRow("Velocity", `${vTotal} m/s`);
  drawRow("Kinetic Energy", `${KE} J`);
  drawRow("Potential Energy", `${PE} J`);
  
  ctx.textAlign = "left";
};