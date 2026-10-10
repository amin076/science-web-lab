/** Fold the engine's paraxial ray coordinates into the Newtonian light path.
 * Component silhouettes are schematic; no lens-prescription ray tracing implied.
 */
export function drawNewtonian(ctx, { width: w, height: h }, p, state, time) {
  const small = w < 620;
  const fold = Math.min(p.objectiveFocal * 0.7, p.separation * 0.65);
  const scale = Math.min((w - 95) / (p.objectiveFocal * 1.15), h * 0.43 / (p.separation - fold + 50)) * p.zoom;
  const px = w * 0.83 + p.panX * w, axis = h * 0.70 + p.panY * h;
  const fx = px - fold * scale, ey = axis - (p.separation - fold) * scale;
  const half = Math.min(h * 0.18, 95) * p.zoom, sag = Math.min(28, half * 0.32);
  const mirrorX = y => px - sag * ((y - axis) / half) ** 2;
  const line = (points, color, width = 1.5) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); };
  const text = (value,x,y,color='#a7b8cc',size=11) => { ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(value,Math.max(12,Math.min(w-100,x)),y); };
  ctx.fillStyle = '#030711'; ctx.fillRect(0,0,w,h);
  ctx.setLineDash([4,6]); line([[18,axis],[px,axis]],'#294156',1); line([[fx,axis],[fx,ey-30]],'#294156',1); ctx.setLineDash([]);
  // A single open parabolic reflecting surface, with opaque backing and hatching.
  const curve = Array.from({length:41},(_,i)=>{const y=axis-half+i*half/20;return [mirrorX(y),y];});
  ctx.beginPath(); curve.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  [...curve].reverse().forEach(([x,y])=>ctx.lineTo(x+9,y));ctx.closePath();ctx.fillStyle='#64748b';ctx.fill();
  line(curve,'#e2e8f0',4);
  for(let y=axis-half+8;y<axis+half;y+=13)line([[mirrorX(y)+8,y],[mirrorX(y)+16,y-7]],'#64748b',1);
  text('Concave primary mirror',px-110,axis+half+24,'#e2e8f0',small?10:12);
  text('Reflective face ←',px-105,axis+half+40,'#94a3b8',10);
  // Flat diagonal secondary: turns the returning beam towards the eyepiece.
  line([[fx-17,axis-17],[fx+17,axis+17]],'#fbbf24',5);
  text('Flat secondary',fx-100,axis+39,'#fbbf24',small?9:11);
  ctx.strokeStyle='#c4b5fd';ctx.fillStyle='#c4b5fd20';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(fx,ey,Math.max(20,Math.min(45,20*p.zoom)),7*p.zoom,0,0,2*Math.PI);ctx.fill();ctx.stroke();
  text('Eyepiece lens',fx+28,ey+5,'#c4b5fd',small?10:12);
  text('Distant light →',20,axis-half-22,'#86efac',small?10:12);
  const colors=['#a78bfa','#60a5fa','#22d3ee','#fbbf24','#fb7185'];
  if(p.showRays)state.rays.forEach((ray,i)=>{
    const a=ray.afterObjective, y0=a.height*1000;
    // Intersection with diagonal x-y=constant, in millimetres of optical path.
    const atFold=(fold+y0)/(1-a.slope);
    const heightFold=y0+a.slope*atFold;
    const primaryY=axis-ray.incoming.height*1000*scale;
    const primary=[mirrorX(primaryY),primaryY];
    const startX=18+p.panX*w;
    const startY=primaryY+(primary[0]-startX)*ray.incoming.slope;
    const points=[[startX,startY],primary,[fx-heightFold*scale,axis-(atFold-fold)*scale],
      [fx-ray.atEyepiece.height*1000*scale,ey],
      [fx-(ray.outgoing.height*1000+ray.outgoing.slope*45)*scale,ey-45*scale]];
    line(points,colors[i]+'c0',1.7);
    const t=(time*0.3+i*0.13)%1, segment=Math.min(3,Math.floor(t*4)),f=t*4-segment;
    ctx.fillStyle=colors[i];ctx.beginPath();ctx.arc(points[segment][0]*(1-f)+points[segment+1][0]*f,points[segment][1]*(1-f)+points[segment+1][1]*f,3,0,2*Math.PI);ctx.fill();
  });
  // Focus is shown along the folded optical axis, not behind the primary.
  const q=state.intermediateImageDistance*1000;
  const image=q>=fold?[fx,axis-(q-fold)*scale]:[px-q*scale,axis];
  ctx.fillStyle='#86efac';ctx.beginPath();ctx.arc(...image,3,0,2*Math.PI);ctx.fill();
  text('Objective focus',image[0]-105,image[1]-9,'#86efac',10);
  const radius = small ? 24 : 42, cx = 65, cy = Math.max(150, h * 0.29);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 2*Math.PI); ctx.clip();
  ctx.fillStyle='#111e31';ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
  ctx.filter=`blur(${Math.min(12,state.exitAngularSpread*200)}px)`;
  const size=radius*Math.min(1.7,Math.max(0.2,Math.abs(state.focusedMagnification || 1)/12));
  ctx.strokeStyle='#d4c5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,size*0.5,0,2*Math.PI);ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx,cy,size,size*0.2,-0.3,0,2*Math.PI);ctx.stroke();ctx.restore();
  text('Illustrative view',cx-radius-5,cy+radius+17,'#94a3b8',10);
  text('Newtonian reflector · light returns from the mirror, then turns upward',16,h-40,'#b5c4d8',small?8:11);
  text('One powered mirror + flat fold + one eyepiece lens · schematic components',16,h-24,'#64748b',small?8:10);
  text(`Optical path: ${p.separation.toFixed(1)} mm · drag to pan`,16,h-9,'#64748b',10);
}
