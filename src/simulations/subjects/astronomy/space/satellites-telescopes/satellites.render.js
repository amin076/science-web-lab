// src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.render.js
import { COLORS } from "./satellites.constants.js";

/**
 * Draws the Earth using an Image Texture + Atmosphere Shaders
 */
export function drawEarthTextured(ctx, cx, cy, radius, rotationRad, img) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Atmosphere Halo (Outer Glow)
  const halo = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.15);
  halo.addColorStop(0, "rgba(100, 180, 255, 0.4)");
  halo.addColorStop(0.5, "rgba(60, 120, 255, 0.1)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // 2. Texture Mapping
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip(); 
  ctx.rotate(rotationRad);
  if (img && img.complete) {
    ctx.filter = "brightness(1.1) contrast(1.1)";
    ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = "#1565C0";
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  }
  ctx.restore(); 

  // 3. Inner Atmosphere Rim 
  const rim = ctx.createRadialGradient(0, 0, radius * 0.9, 0, 0, radius);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(135, 206, 235, 0.4)");
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Night Side Shadow
  ctx.rotate(Math.PI / 4); 
  const nightShadow = ctx.createLinearGradient(-radius, 0, radius, 0);
  nightShadow.addColorStop(0, "rgba(0,0,0,0)");
  nightShadow.addColorStop(0.4, "rgba(0,0,0,0.2)");
  nightShadow.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = nightShadow;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 2, 0, Math.PI * 2); 
  ctx.fill();

  ctx.restore();
}

export function drawMoon(ctx, x, y, radius, img, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.shadowColor = "#FFF";
  ctx.shadowBlur = radius * 0.2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();
  if (img && img.complete) {
    ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
  } else {
    ctx.fillStyle = "#DDDDDD";
    ctx.fill();
  }
  ctx.restore();

  const shadow = ctx.createRadialGradient(-radius*0.3, -radius*0.3, radius*0.5, 0, 0, radius);
  shadow.addColorStop(0, "rgba(0,0,0,0)");
  shadow.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawOrbitPath(ctx, cx, cy, radiusPx) {
  ctx.strokeStyle = COLORS.ORBIT_LINE;
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawStars(ctx, stars, zoom) {
  ctx.fillStyle = "#FFFFFF";
  stars.forEach(star => {
    const visibleSize = Math.max(0.3, Math.min(1.2, star.r / zoom));
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, visibleSize, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}

export function drawSatellite(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.fillRect(-6, -2, 12, 4); 
  ctx.fillStyle = "#FFF";
  ctx.fillRect(-2, -2, 4, 4); 
  ctx.restore();
}

export function drawISS(ctx, x, y, vel) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(vel.y, vel.x));
  const S = 1.8; 
  ctx.scale(S, S);
  
  // Truss
  ctx.fillStyle = "#90A4AE"; 
  ctx.fillRect(-16, -1, 32, 2);
  
  // Solar Panels
  ctx.fillStyle = "#D84315"; 
  ctx.fillRect(-14, -8, 4, 8); ctx.fillRect(-14, 2, 4, 8);
  ctx.fillRect(10, -8, 4, 8); ctx.fillRect(10, 2, 4, 8);
  
  // Modules
  ctx.fillStyle = "#FFF"; 
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

export function drawHubble(ctx, x, y, vel) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(vel.y, vel.x) + Math.PI/2); 
  
  const S = 1.8;
  ctx.scale(S, S);

  // Main Tube
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(-3, -8, 6, 16);
  
  // Aperture
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(0, -8, 2.8, 0, Math.PI, true); ctx.fill();

  // Solar Panels
  ctx.fillStyle = "#2962FF";
  ctx.fillRect(-12, -3, 9, 6);
  ctx.fillRect(3, -3, 9, 6);

  ctx.restore();
}

export function drawJWST(ctx, x, y, vel) {
  ctx.save();
  ctx.translate(x, y);
  
  // JWST orientation
  const angle = Math.atan2(y, x); 
  ctx.rotate(angle);

  const S = 2.0;
  ctx.scale(S, S);

  // Sunshield
  ctx.fillStyle = "#CE93D8"; 
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(6, 4); ctx.lineTo(0, 6); ctx.lineTo(-6, 4);
  ctx.closePath(); ctx.fill();

  // Primary Mirror
  ctx.fillStyle = "#FFD700"; 
  ctx.beginPath(); ctx.arc(0, -2, 3.5, 0, Math.PI*2); ctx.fill();

  // Secondary Mirror Support
  ctx.strokeStyle = "#333"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(0, -6); ctx.lineTo(2, -2); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(0, -6, 0.8, 0, Math.PI*2); ctx.fill();

  ctx.restore();
}

// GENERIC TELESCOPE FALLBACK
export function drawTelescope(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#EEE"; ctx.fillRect(-3, -6, 6, 12);
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, -6, 2.5, 0, Math.PI, true); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -3, 7, 6); ctx.fillRect(3, -3, 7, 6);
  ctx.restore();
}