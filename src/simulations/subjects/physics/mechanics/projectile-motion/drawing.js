// src/simulations/subjects/physics/mechanics/projectile-motion/utils/drawing.js

export const worldToScreen = (wx, wy, view, canvasHeight) => {
  return {
    x: wx * view.scale + view.x,
    y: canvasHeight - (wy * view.scale + view.y)
  };
};

// --- ENVIRONMENT DRAWING ---

const drawCloud = (ctx, x, y, scale) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(-20, 0, 20, 0, Math.PI * 2);
  ctx.arc(20, 0, 25, 0, Math.PI * 2);
  ctx.arc(0, -15, 25, 0, Math.PI * 2);
  ctx.arc(0, 10, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawMountain = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + w, y);
  ctx.fill();
};

export const drawEnvironment = (ctx, view, width, height) => {
  const groundY = height - (0 * view.scale + view.y);

  // 1. PRO SKY GRADIENT
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, "#2980b9"); // Nice solid blue
  skyGrad.addColorStop(1, "#6dd5fa"); // Light atmospheric blue
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. SUN (Crisper, less bloom)
  ctx.fillStyle = "#FDB813";
  ctx.shadowColor = "rgba(253, 184, 19, 0.4)";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(width - 80, 80, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset shadow

  // 3. BACKGROUND MOUNTAINS (Parallax effect based on view.x)
  // We use a slow factor (0.1) so they move slowly like distant objects
  const mtOffset = view.x * 0.1; 
  const baseY = groundY;
  
  // Draw a few repeating mountains
  // We loop to cover the screen width
  const mtWidth = 400;
  const startMt = Math.floor((mtOffset - 200) / mtWidth) * mtWidth;
  
  for(let mx = startMt; mx < startMt + width + mtWidth * 2; mx += mtWidth) {
      // Relative screen X
      const sx = mx - mtOffset;
      // Random-ish variation based on index
      const hVar = Math.sin(mx) * 50; 
      
      drawMountain(ctx, sx, baseY, 500, 150 + hVar, "rgba(20, 30, 60, 0.2)"); // Distant dark blue
      drawMountain(ctx, sx + 250, baseY, 300, 100 - hVar, "rgba(20, 30, 60, 0.15)");
  }

  // 4. CLOUDS
  const cloudOffset = view.x * 0.2;
  drawCloud(ctx, (150 + cloudOffset) % (width + 400) - 200, 100, 1.2);
  drawCloud(ctx, (700 + cloudOffset) % (width + 500) - 200, 160, 0.9);

  // 5. GROUND & ROAD
  if (groundY < height) {
    // Grass / Terrain base
    ctx.fillStyle = "#384c5e"; // Dark slate ground (Professional look)
    ctx.fillRect(0, groundY, width, height - groundY);

    const roadHeight = 50;
    
    // Asphalt Road
    ctx.fillStyle = "#2c3e50"; // Dark asphalt
    ctx.fillRect(0, groundY, width, roadHeight);
    
    // Top Edge of Road
    ctx.strokeStyle = "#95a5a6";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(width, groundY); ctx.stroke();

    // Measurement Grid on Road
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, width, roadHeight);
    ctx.clip();

    const gridSize = 10 * view.scale; // 10 meters
    const majorGrid = 50 * view.scale; // 50 meters
    const offsetX = view.x % gridSize;

    for (let x = offsetX; x < width; x += gridSize) {
       const isMajor = Math.abs((x - view.x) % majorGrid) < 1;
       const worldXVal = Math.round((x - view.x) / view.scale);

       if (isMajor) {
         // Major Mark (50m)
         ctx.fillStyle = "#ecf0f1";
         ctx.fillRect(x - 2, groundY, 4, roadHeight);
         
         // Text
         ctx.fillStyle = "#fff";
         ctx.font = "bold 12px 'Roboto Mono', monospace";
         ctx.textAlign = "center";
         ctx.fillText(`${worldXVal}m`, x, groundY + 35);
       } else {
         // Minor Mark (10m)
         ctx.fillStyle = "rgba(255,255,255,0.3)";
         ctx.fillRect(x - 1, groundY, 2, 10); // Top tick
       }
    }
    ctx.restore();
  }
};

// --- DRAW OBJECTS ---

const drawBallElements = (ctx, obj, scale) => {
    const r = Math.max(4, obj.radius * scale);
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.ellipse(r * 0.2, r * 0.8, r, r*0.4, 0, 0, Math.PI*2); ctx.fill();
    
    // Ball gradient
    const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
    grad.addColorStop(0, "#fff"); grad.addColorStop(0.3, obj.color); grad.addColorStop(1, "#111");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    
    // Gloss
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath(); ctx.arc(-r*0.3, -r*0.3, r*0.2, 0, Math.PI*2); ctx.fill();
};

const drawCarElements = (ctx, obj, scale) => {
    const w = obj.width * scale;
    const h = obj.height * scale;
    const chassisH = h * 0.4;
    const cabinH = h * 0.5;
    const wheelR = h * 0.28;

    // Sharp Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(-w/2 + 5, 0, w, 4);

    // Chassis
    ctx.fillStyle = obj.color; // Car color
    ctx.beginPath();
    ctx.moveTo(-w/2, -chassisH);
    ctx.lineTo(w/2, -chassisH);
    ctx.lineTo(w/2, 0); // Bottom right
    ctx.lineTo(-w/2 + w*0.05, 0); // Bottom left (slight angle)
    ctx.fill();

    // Cabin
    ctx.fillStyle = "#2c3e50"; // Dark cabin
    ctx.beginPath();
    ctx.moveTo(-w*0.3, -chassisH);
    ctx.lineTo(-w*0.2, -(chassisH+cabinH));
    ctx.lineTo(w*0.1, -(chassisH+cabinH));
    ctx.lineTo(w*0.3, -chassisH);
    ctx.fill();
    
    // Windows
    ctx.fillStyle = "#81ecec";
    ctx.beginPath();
    ctx.moveTo(-w*0.28, -chassisH - 2);
    ctx.lineTo(-w*0.19, -(chassisH+cabinH) + 2);
    ctx.lineTo(w*0.09, -(chassisH+cabinH) + 2);
    ctx.lineTo(w*0.28, -chassisH - 2);
    ctx.fill();

    // Wheels
    const drawWheel = (wx) => {
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(wx, 0, wheelR, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#bdc3c7";
      ctx.beginPath(); ctx.arc(wx, 0, wheelR*0.6, 0, Math.PI*2); ctx.fill();
    };
    drawWheel(-w*0.25);
    drawWheel(w*0.25);
};

const drawPlaneElements = (ctx, obj, scale) => {
  const w = obj.width * scale;
  const h = obj.height * scale;
  const bodyColor = obj.color;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath(); ctx.ellipse(0, h*2, w*0.5, h*0.2, 0, 0, Math.PI*2); ctx.fill();

  // Fuselage
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -h*0.2, w*0.5, h*0.22, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.moveTo(-w*0.35, -h*0.2);
  ctx.lineTo(-w*0.55, -h*0.8);
  ctx.lineTo(-w*0.4, -h*0.2);
  ctx.fill();

  // Wing (Far)
  ctx.fillStyle = "#95a5a6";
  ctx.beginPath();
  ctx.moveTo(w*0.1, -h*0.3);
  ctx.lineTo(-w*0.1, -h*0.5); // Back sweep
  ctx.lineTo(0, -h*0.3);
  ctx.fill();

  // Wing (Near)
  ctx.fillStyle = "#bdc3c7";
  ctx.beginPath();
  ctx.moveTo(w*0.1, -h*0.1);
  ctx.lineTo(-w*0.1, h*0.3); // Back sweep down
  ctx.lineTo(0, -h*0.1);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = "#74b9ff";
  ctx.beginPath();
  ctx.ellipse(w*0.35, -h*0.25, w*0.1, h*0.08, 0, 0, Math.PI*2);
  ctx.fill();
};

const drawParcelElements = (ctx, obj, scale) => {
  const size = Math.max(10, obj.width * scale); 

  // Box Body (3D effect)
  ctx.fillStyle = "#d35400"; // Darker side
  ctx.fillRect(-size/2 + 4, -size + 4, size, size); 

  ctx.fillStyle = "#e67e22"; // Front face
  ctx.fillRect(-size/2, -size, size, size);

  // Tape
  ctx.fillStyle = "#f39c12"; 
  ctx.fillRect(-size/2, -size/2 - 2, size, 4); 
  ctx.fillRect(-2, -size, 4, size); 
  
  // Border
  ctx.strokeStyle = "#8e44ad"; // Contrast outline
  ctx.lineWidth = 1;
  ctx.strokeRect(-size/2, -size, size, size);
};

export const drawObject = (ctx, obj, view, canvasHeight, vectorMode) => {
  const pos = worldToScreen(obj.x, obj.y, view, canvasHeight);
  // Optimization
  if (pos.x < -200 || pos.x > ctx.canvas.width + 200 || pos.y < -200 || pos.y > ctx.canvas.height + 200) return;

  ctx.save();
  ctx.translate(pos.x, pos.y);
  
  if ((obj.type === "car" || obj.type === "plane") && obj.vx < 0) {
    ctx.scale(-1, 1);
  }

  if (obj.type === "ball") drawBallElements(ctx, obj, view.scale);
  else if (obj.type === "car") drawCarElements(ctx, obj, view.scale);
  else if (obj.type === "plane") drawPlaneElements(ctx, obj, view.scale);
  else if (obj.type === "parcel") drawParcelElements(ctx, obj, view.scale);

  ctx.restore();

  // Vectors (Bold and clear)
  const vScale = view.scale * 0.5;
  if (vectorMode.x) drawArrow(ctx, pos.x, pos.y, pos.x + obj.vx * vScale, pos.y, "#00e676", 3);
  if (vectorMode.y) drawArrow(ctx, pos.x, pos.y, pos.x, pos.y - obj.vy * vScale, "#2979ff", 3);
  if (vectorMode.v) drawArrow(ctx, pos.x, pos.y, pos.x + obj.vx * vScale, pos.y - obj.vy * vScale, "#ff3d00", 4);
};

const drawArrow = (ctx, x1, y1, x2, y2, color, width) => {
  const len = Math.hypot(x2-x1, y2-y1);
  if(len < 5) return;
  
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 12;

  ctx.strokeStyle = "rgba(0,0,0,0.5)"; // Shadow
  ctx.lineWidth = width + 2;
  ctx.beginPath(); ctx.moveTo(x1+1, y1+1); ctx.lineTo(x2+1, y2+1); ctx.stroke();

  ctx.strokeStyle = color; 
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  
  ctx.fillStyle = color; 
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI/6), y2 - head * Math.sin(angle - Math.PI/6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI/6), y2 - head * Math.sin(angle + Math.PI/6));
  ctx.fill();
};

export const drawTrajectory = (ctx, trail, view, height) => {
  if (trail.length < 2) return;
  
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 4;

  ctx.beginPath();
  const step = Math.max(1, Math.ceil(trail.length / 200));
  const start = worldToScreen(trail[0].x, trail[0].y, view, height);
  ctx.moveTo(start.x, start.y);
  
  for(let i=step; i<trail.length; i+=step) {
    const pt = worldToScreen(trail[i].x, trail[i].y, view, height);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
};

// --- NEW PRO HUD ---
export const drawModernHUD = (ctx, obj, view, canvasHeight, gravity) => {
  const pos = worldToScreen(obj.x, obj.y, view, canvasHeight);
  
  // Calculate physics values
  const vSq = obj.vx * obj.vx + obj.vy * obj.vy;
  const velocity = Math.sqrt(vSq);
  const KE = 0.5 * obj.mass * vSq;
  const PE = obj.mass * gravity * Math.max(0, obj.y);

  // HUD Box Geometry
  const width = 180;
  const height = 140;
  const offsetDistance = 60; // Distance from object
  const startX = pos.x + offsetDistance;
  const startY = pos.y - 100;

  // 1. Draw Connector Line (Crisp)
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  
  ctx.beginPath();
  // Small target circle on object
  ctx.arc(pos.x, pos.y, 4, 0, Math.PI*2);
  // Line to box
  ctx.moveTo(pos.x + 4, pos.y - 4);
  ctx.lineTo(startX, startY + height/2);
  ctx.stroke();

  // 2. HUD Background (Solid Dark Slate)
  ctx.fillStyle = "rgba(15, 23, 42, 0.95)"; // Very opaque dark blue/slate
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"; // Thin border
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.roundRect(startX, startY, width, height, 6);
  ctx.fill();
  ctx.stroke();

  // 3. Header
  ctx.fillStyle = obj.color;
  ctx.fillRect(startX + 6, startY + 12, 4, 14); // Color indicator strip

  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(obj.id.toUpperCase(), startX + 16, startY + 24);

  // Speed Badge
  const speedText = `${velocity.toFixed(1)} m/s`;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.roundRect(startX + width - 70, startY + 10, 64, 18, 4);
  ctx.fill();
  
  ctx.fillStyle = "#4ECDC4"; // Cyan text for speed
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText(speedText, startX + width - 38, startY + 22);

  // Separator
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath(); ctx.moveTo(startX, startY + 36); ctx.lineTo(startX + width, startY + 36); ctx.stroke();

  // 4. Data Rows
  let rowY = startY + 55;
  const rightAlign = startX + width - 10;
  const leftAlign = startX + 10;

  const drawRow = (label, value) => {
      ctx.fillStyle = "#94a3b8"; // Light slate text
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, leftAlign, rowY);
      
      ctx.fillStyle = "#fff"; // Bright white numbers
      ctx.font = "11px 'Roboto Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, rightAlign, rowY);
      rowY += 18;
  };

  drawRow("Position X", `${obj.x.toFixed(1)} m`);
  drawRow("Height Y", `${obj.y.toFixed(1)} m`);
  
  rowY += 4;
  
  // Energy Mini-Bars
  const drawEnergyBar = (label, val, max, color) => {
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.font = "10px sans-serif";
      ctx.fillText(label, leftAlign, rowY);
      
      // Bar Background
      const barW = 80;
      const barH = 4;
      const barX = startX + 60;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(barX, rowY - 6, barW, barH);
      
      // Fill
      const fillW = Math.min(barW, (val / max) * barW);
      ctx.fillStyle = color;
      ctx.fillRect(barX, rowY - 6, fillW, barH);
      
      // Value
      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(val), rightAlign, rowY);
      
      rowY += 15;
  };

  // Estimate max energy for bar scaling (soft cap 10000 J)
  const maxE = 10000;
  drawEnergyBar("KE (J)", KE, maxE, "#f1c40f");
  drawEnergyBar("PE (J)", PE, maxE, "#2ecc71");
};