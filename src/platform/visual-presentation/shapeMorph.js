/**
 * Presentation-only geometry helpers. They must never be used to generate
 * canonical physics or mathematical measurements.
 */
export function resampleClosedOutline(vertices,count=240){
  if(!Array.isArray(vertices)||vertices.length<3||!Number.isInteger(count)||count<3||count>2000)
    throw new RangeError("Invalid outline or sample count");
  const edges=vertices.map((a,i)=>{
    const b=vertices[(i+1)%vertices.length];
    if(!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isFinite(v)))throw new RangeError("Invalid outline vertex");
    return Math.hypot(b[0]-a[0],b[1]-a[1]);
  });
  const length=edges.reduce((a,b)=>a+b,0);
  if(!(length>0))throw new RangeError("Outline has zero perimeter");
  const result=[];let edge=0,cumulative=0;
  for(let j=0;j<count;j++){
    const distance=length*j/count;
    while(edge<edges.length-1 && distance>=cumulative+edges[edge]){
      cumulative+=edges[edge];edge++;
    }
    const a=vertices[edge],b=vertices[(edge+1)%vertices.length];
    const t=edges[edge]===0?0:(distance-cumulative)/edges[edge];
    result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
  }
  return result;
}
export function interpolateOutlines(a,b,t){
  if(a.length!==b.length || !Number.isFinite(t) || t<0 || t>1)throw new RangeError("Invalid outline interpolation");
  return a.map((v,i)=>[v[0]+(b[i][0]-v[0])*t,v[1]+(b[i][1]-v[1])*t]);
}
