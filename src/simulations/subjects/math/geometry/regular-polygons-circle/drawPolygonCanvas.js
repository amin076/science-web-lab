import {computeRegularPolygons} from "../../../../esbiko-physics/math/regularPolygonModel.js";

const TAU=2*Math.PI;
const fmt=(value)=>Number(value.toPrecision(5)).toString();
const regularVertices=(n,r,start)=>Array.from({length:n},(_,i)=>[r*Math.cos(start+TAU*i/n),r*Math.sin(start+TAU*i/n)]);
function poly(ctx,vertices){ctx.beginPath();vertices.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function drawPolygonCanvas(ctx,state,{width,height,camera}){
  const p=state.parameters, g=state.physics?.geometry||computeRegularPolygons(p.sides,p.radius);
  const n=g.sides, R=g.radius;
  ctx.fillStyle="#f8fbff";ctx.fillRect(0,0,width,height);
  const grid=30;ctx.strokeStyle="#e9eff7";ctx.lineWidth=1;
  for(let x=0;x<width;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
  for(let y=0;y<height;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
  const margin=Math.min(40,Math.max(15,width*.05)),limit=Math.max(g.outer.circumradius/R,1);
  const px=Math.min((width-2*margin)/(2*limit),(height-2*margin)/(2*limit))*.86*camera.zoom;
  ctx.save();ctx.translate(width/2+camera.x*width*.2,height/2+camera.y*height*.2);
  ctx.scale(px/R,px/R);
  // n odd: one vertex points up and the opposite edge is horizontal.
  // n even: horizontal top and bottom edges.
  const start=-Math.PI/2+(n%2===0?Math.PI/n:0);
  const inner=regularVertices(n,R,start),outer=regularVertices(n,g.outer.circumradius,start);
  ctx.lineJoin="round";ctx.lineCap="round";
  poly(ctx,outer);ctx.fillStyle="rgba(236,153,56,.16)";ctx.fill();
  ctx.strokeStyle="#db8425";ctx.lineWidth=2.8*R/px;ctx.stroke();
  poly(ctx,inner);ctx.fillStyle="rgba(45,123,219,.21)";ctx.fill();
  ctx.strokeStyle="#2774c9";ctx.lineWidth=2.8*R/px;ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.strokeStyle="#19856f";ctx.lineWidth=3*R/px;ctx.stroke();
  if(p.showGuides){
    const a=inner[0],b=inner[1];
    ctx.setLineDash([6*R/px,5*R/px]);ctx.strokeStyle="#36536d";ctx.lineWidth=1.6*R/px;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(...a);ctx.moveTo(0,0);ctx.lineTo(...b);ctx.stroke();
    const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(...m);ctx.stroke();
    ctx.setLineDash([]);
  }
  if(p.showTangencies){
    const m=start+Math.PI/n;
    for(let i=0;i<n;i++){
      const a=m+TAU*i/n;
      ctx.beginPath();ctx.arc(R*Math.cos(a),R*Math.sin(a),3*R/px,0,TAU);
      ctx.fillStyle="#cf771a";ctx.fill();
    }
  }
  if(p.showAngles){
    const a=start+Math.PI/n, phase=state.physics?.phaseRadians||0;
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*.29,a,a+TAU/n);ctx.closePath();
    ctx.fillStyle="rgba(43,111,214,.27)";ctx.fill();
    ctx.strokeStyle="#2360b0";ctx.lineWidth=2*R/px;ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(R*.9*Math.cos(a+phase),R*.9*Math.sin(a+phase));
    ctx.strokeStyle="#6b52c7";ctx.lineWidth=1.7*R/px;ctx.stroke();
  }
  ctx.beginPath();ctx.arc(0,0,3.5*R/px,0,TAU);ctx.fillStyle="#1c3553";ctx.fill();
  ctx.restore();
  ctx.fillStyle="#1d3554";ctx.font="600 13px system-ui";ctx.fillText("R = "+fmt(R),14,22);
  ctx.font="12px system-ui";ctx.fillStyle="#526b84";
  ctx.fillText(n+" sides • "+fmt(g.interiorAngleDegrees)+"° interior angle",14,height-14);
}
