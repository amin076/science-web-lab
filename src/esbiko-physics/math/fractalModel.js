/* Canonical Esbiko fractal model — browser and server shared source */
const TYPES=Object.freeze({
 triangle:{label:'Sierpinski Triangle',fa:'مثلث سیرپینسکی',max:16,initial:5},
 carpet:{label:'Sierpinski Carpet',fa:'فرش سیرپینسکی',max:9,initial:4},
 dust:{label:'Cantor Dust',fa:'غبار کانتور',max:11,initial:5},
 koch:{label:'Koch Snowflake',fa:'دانه‌برف کخ',max:9,initial:4},
 tree:{label:'Binary Fractal Tree',fa:'درخت دودویی',max:15,initial:9},
 vicsek:{label:'Vicsek Cross',fa:'فراکتال ویچک ـ صلیبی',max:9,initial:5},
 vicsek_x:{label:'Vicsek X',fa:'فراکتال ویچک ـ قطری',max:9,initial:5},
 pentagon:{label:'Sierpinski Pentagon',fa:'پنج‌ضلعی سیرپینسکی',max:9,initial:5},
 hexaflake:{label:'Hexaflake',fa:'برف‌وارهٔ شش‌ضلعی',max:8,initial:4},
 levy:{label:'Levy C Curve',fa:'منحنی C لِوی',max:17,initial:11},
 dragon:{label:'Heighway Dragon',fa:'اژدهای های‌وی',max:18,initial:13},
 hilbert:{label:'Hilbert Curve',fa:'منحنی هیلبرت',max:7,initial:5},
 pythagoras:{label:'Pythagoras Tree',fa:'درخت فیثاغورث',max:13,initial:9},
 minkowski:{label:'Minkowski Sausage',fa:'منحنی مینکوفسکی',max:6,initial:4},
 fern:{label:'Barnsley Fern',fa:'سرخس بارنزلی',max:10,initial:7},
 mandelbrot:{label:'Mandelbrot Set',fa:'مجموعهٔ ماندلبرو',max:12,initial:6},
 julia:{label:'Julia Set',fa:'مجموعهٔ ژولیا',max:12,initial:6},
 burning_ship:{label:'Burning Ship',fa:'کشتی سوزان',max:12,initial:6},
 tricorn:{label:'Tricorn / Mandelbar',fa:'مجموعهٔ سه‌شاخ',max:12,initial:6}
});
const PALETTES=['aurora','nebula','prism','sunset','electric','amethyst','ocean','forest','gold','mono'];
const DEFAULTS=Object.freeze({type:'triangle',level:5,ratio:.5,gridSize:3,angle:60,speed:1,palette:'nebula',showGrid:false,outlines:false,gradient:true,glow:48,hueShift:0,lightAngle:45,detail:1,juliaReal:-.74543,juliaImag:.11301});
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const ESCAPE_TYPES=['mandelbrot','julia','burning_ship','tricorn'];
function normalise(previous,patch={}){
 if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).some(k=>!Object.hasOwn(DEFAULTS,k)))throw new TypeError('Unknown fractal parameter');
 const p={...previous,...patch};if(!Object.hasOwn(TYPES,p.type))throw new RangeError('Invalid fractal type');
 for(const k of ['level','ratio','gridSize','angle','speed','glow','hueShift','lightAngle','detail','juliaReal','juliaImag'])if(typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new TypeError('Invalid '+k);
 if(!Number.isInteger(p.level)||p.level<0||p.level>TYPES[p.type].max)throw new RangeError('Invalid level');
 if(p.ratio<.2||p.ratio>.65)throw new RangeError('Ratio must be between .2 and .65');
 if(!Number.isInteger(p.gridSize)||p.gridSize<3||p.gridSize>6)throw new RangeError('Invalid grid size');
 if(p.angle<20||p.angle>80)throw new RangeError('Invalid angle');
 if(p.speed<.25||p.speed>4)throw new RangeError('Invalid speed');
 if(p.glow<0||p.glow>100||p.hueShift<0||p.hueShift>360||p.lightAngle<0||p.lightAngle>360||p.detail<.5||p.detail>1.5)throw new RangeError('Invalid artistic parameter');
 if(Math.abs(p.juliaReal)>2||Math.abs(p.juliaImag)>2)throw new RangeError('Invalid Julia coordinate');
 if(!PALETTES.includes(p.palette))throw new RangeError('Invalid palette');
 for(const k of ['showGrid','outlines','gradient'])if(typeof p[k]!=='boolean')throw new TypeError('Invalid '+k);
 return p;
}
function carpetCells(n){const cells=[],m=(n-1)/2;for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(!(Math.abs(row-m)<.51&&Math.abs(col-m)<.51))cells.push([col,row]);return cells;}
const FERN_SAMPLES=[1,250,750,2000,5000,11000,23000,44000,75000,105000,145000];
function stats(p){
 let childCount=null,shrink=null,similarityDimension=null,isDimensionExact=false,description='',theoreticalElements=null;
 switch(p.type){
 case 'triangle':childCount=3;shrink=p.ratio;isDimensionExact=p.ratio<=.5;description='سه کپی رأس‌محور؛ کپی‌های بزرگ‌تر از نصف هم‌پوشانی دارند.';break;
 case 'dust':childCount=4;shrink=p.ratio;isDimensionExact=p.ratio<=.5;description='چهار کپی در گوشه‌های مربع.';break;
 case 'carpet':childCount=carpetCells(p.gridSize).length;shrink=1/p.gridSize;isDimensionExact=true;description='حذف خانه یا بلوک مرکزی شبکه.';break;
 case 'koch':childCount=4;shrink=1/(2+2*Math.cos(p.angle*Math.PI/180));isDimensionExact=p.angle===60;description='جایگزینی هر ضلع با چهار پاره‌خط؛ زاویهٔ استاندارد ۶۰ درجه.';break;
 case 'tree':childCount=2;shrink=.69;description='دو شاخه با زاویهٔ قابل تغییر؛ بُعد واقعی از شمارش شاخه‌ها به دست نمی‌آید.';break;
 case 'vicsek':case 'vicsek_x':childCount=5;shrink=1/3;isDimensionExact=true;description='پنج خانه از شبکهٔ ۳×۳ باقی می‌مانند.';break;
 case 'pentagon':childCount=5;shrink=(3-Math.sqrt(5))/2;isDimensionExact=true;description='پنج پنج‌ضلعی کوچک در پنج رأس.';break;
 case 'hexaflake':childCount=7;shrink=1/3;isDimensionExact=true;description='هفت شش‌ضلعی در یک الگوی تکراری.';break;
 case 'levy':case 'dragon':childCount=2;shrink=1/Math.sqrt(2);isDimensionExact=true;description='هر پاره‌خط به دو قسمت با چرخش ۹۰ درجه تقسیم می‌شود.';break;
 case 'hilbert':childCount=4;shrink=.5;isDimensionExact=true;description='منحنی پیوستهٔ پرکنندهٔ صفحه در حد تکرارهای بی‌نهایت.';break;
 case 'pythagoras':childCount=2;shrink=null;description='درخت مربعی بر پایهٔ قضیهٔ فیثاغورث؛ نسبت دو فرزند برابر نیست.';break;
 case 'minkowski':childCount=8;shrink=.25;isDimensionExact=true;description='ژنراتور هشت‌قسمتی مینکوفسکی با مقیاس یک‌چهارم.';break;
 case 'fern':description='سرخس با سیستم توابع تکرارشونده و نمونه‌گیری تصادفیِ بازتولیدپذیر.';theoreticalElements=FERN_SAMPLES[p.level];break;
 default:description='فراکتال مختلط با الگوریتم زمان خروج؛ بُعد با فرمول خودتشابه به‌دست نمی‌آید.';theoreticalElements=(60+36*p.level);break;
 }
 if(shrink!==null&&childCount!==null)similarityDimension=Math.log(childCount)/Math.log(1/shrink);
 if(theoreticalElements===null){
  if(p.type==='tree'||p.type==='pythagoras')theoreticalElements=2**(p.level+1)-1;
  else if(p.type==='hilbert')theoreticalElements=4**p.level;
  else theoreticalElements=(['koch','minkowski'].includes(p.type)?(p.type==='koch'?3:4):1)*childCount**p.level;
 }
 return {type:p.type,level:p.level,childCount,shrink,similarityDimension,isDimensionExact,theoreticalElements,description};
}
const lerp=(a,b,t)=>[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];
function intersects(points,rect,pad=0){if(!rect)return true;let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;for(const p of points){a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1]);}return !(b+pad<rect.x0||a-pad>rect.x1||d+pad<rect.y0||c-pad>rect.y1);}
function regularPolygon(cx,cy,r,n,rotation=-Math.PI/2){return Array.from({length:n},(_,i)=>[cx+r*Math.cos(rotation+2*Math.PI*i/n),cy+r*Math.sin(rotation+2*Math.PI*i/n)]);}
function hilbertXY(n,i){let x=0,y=0,t=i;for(let s=1;s<n;s*=2){const rx=1&(t/2),ry=1&(t^rx);if(ry===0){if(rx===1){x=s-1-x;y=s-1-y;}const z=x;x=y;y=z;}x+=s*rx;y+=s*ry;t=Math.floor(t/4);}return[x,y];}
/** Geometry visitor; pixel-level culling avoids exponential paint work on deep zooms. */
function walkFractal(p,{viewport=null,scale=400,minPixels=.7,maxNodes=240000,triangle=()=>{},square=()=>{},polygon=()=>{},segment=()=>{},branch=()=>{},dot=()=>{}}={}){
 let visited=0,painted=0,approximate=0,limited=false;
 const visit=()=>{if(++visited>maxNodes){limited=true;return false;}return true;};
 const emitPolygon=(poly,d)=>{polygon(poly,d);painted++;};
 if(p.type==='triangle'){
  const stack=[[[0,-.84],[-.96,.82],[.96,.82],0]];
  while(stack.length){if(!visit())break;const[a,b,c,d]=stack.pop();if(!intersects([a,b,c],viewport))continue;
   const sz=Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(a[0]-c[0],a[1]-c[1]));
   if(d===p.level||sz*scale<minPixels){triangle([a,b,c],d);painted++;if(d<p.level)approximate++;continue;}
   const r=p.ratio;stack.push([c,lerp(c,a,r),lerp(c,b,r),d+1],[b,lerp(b,c,r),lerp(b,a,r),d+1],[a,lerp(a,b,r),lerp(a,c,r),d+1]);
  }
 }else if(['carpet','dust','vicsek','vicsek_x'].includes(p.type)){
  const stack=[[-.84,-.84,1.68,0]],cells=p.type==='carpet'?carpetCells(p.gridSize):null;
  while(stack.length){if(!visit())break;const[x,y,s,d]=stack.pop();if(!intersects([[x,y],[x+s,y+s]],viewport))continue;
   if(d===p.level||s*scale<minPixels){square(x,y,s,d);painted++;if(d<p.level)approximate++;continue;}
   if(p.type==='carpet'||p.type.startsWith('vicsek')){
    const n=p.type==='carpet'?p.gridSize:3,u=s/n;
    const coords=p.type==='carpet'?cells:p.type==='vicsek'?[[1,1],[0,1],[2,1],[1,0],[1,2]]:[[1,1],[0,0],[0,2],[2,0],[2,2]];
    for(let j=coords.length-1;j>=0;j--){const[c,r]=coords[j];stack.push([x+c*u,y+r*u,u,d+1]);}
   }else{const u=s*p.ratio;stack.push([x,y,u,d+1],[x+s-u,y,u,d+1],[x,y+s-u,u,d+1],[x+s-u,y+s-u,u,d+1]);}
  }
 }else if(p.type==='pentagon'||p.type==='hexaflake'){
  const n=p.type==='pentagon'?5:6,r=p.type==='pentagon'?(3-Math.sqrt(5))/2:1/3;
  const stack=[[0,0,.82,0]];
  while(stack.length){if(!visit())break;const[cx,cy,R,d]=stack.pop();if(!intersects([[cx-R,cy-R],[cx+R,cy+R]],viewport))continue;
   if(d===p.level||2*R*scale<minPixels){emitPolygon(regularPolygon(cx,cy,R,n,p.type==='pentagon'?-Math.PI/2:0),d);if(d<p.level)approximate++;continue;}
   if(p.type==='hexaflake')stack.push([cx,cy,R*r,d+1]);
   for(let j=0;j<n;j++){const a=-Math.PI/2+2*Math.PI*j/n;const offset=R*(1-r);stack.push([cx+offset*Math.cos(a),cy+offset*Math.sin(a),R*r,d+1]);}
  }
 }else if(['koch','levy','dragon','minkowski'].includes(p.type)){
  const stack=[];
  if(p.type==='koch'){const tri=[[0,-.72],[-.7,.52],[.7,.52]];for(let i=0;i<3;i++)stack.push([tri[i],tri[(i+1)%3],0,1]);}
  else if(p.type==='minkowski'){const s=[[-.58,-.58],[.58,-.58],[.58,.58],[-.58,.58]];for(let i=0;i<4;i++)stack.push([s[i],s[(i+1)%4],0,1]);}
  else stack.push([[-.77,.2],[.77,.2],0,1]);
  const angle=p.angle*Math.PI/180,cs=Math.cos(angle),sn=Math.sin(angle),r=1/(2+2*cs);
  while(stack.length){if(!visit())break;const[a,b,d,sgn]=stack.pop(),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
   if(!intersects([a,b],viewport,len*.8))continue;
   if(d===p.level||len*scale<minPixels){segment(a,b,d);painted++;if(d<p.level)approximate++;continue;}
   if(p.type==='koch'){
    const q=[a,[a[0]+dx*r,a[1]+dy*r],null,[b[0]-dx*r,b[1]-dy*r],b];q[2]=[q[1][0]+r*(cs*dx-sn*dy),q[1][1]+r*(sn*dx+cs*dy)];
    for(let i=3;i>=0;i--)stack.push([q[i],q[i+1],d+1,1]);
   }else if(p.type==='levy'||p.type==='dragon'){
    const flip=p.type==='levy'?1:sgn,center=[(a[0]+b[0]-flip*dy)/2,(a[1]+b[1]+flip*dx)/2];
    stack.push([center,b,d+1,-flip],[a,center,d+1,flip]);
   }else{
    const pts=[[0,0],[.25,0],[.25,.25],[.5,.25],[.5,0],[.5,-.25],[.75,-.25],[.75,0],[1,0]];
    const q=pts.map(([u,v])=>[a[0]+u*dx-v*dy,a[1]+u*dy+v*dx]);
    for(let i=q.length-2;i>=0;i--)stack.push([q[i],q[i+1],d+1,1]);
   }
  }
 }else if(p.type==='hilbert'){
  const n=2**p.level,N=n*n;if(N>maxNodes)limited=true;let prev=null;
  if(N===1){dot(0,0,0);painted++;return {visited:1,painted,approximate,limited};}
  for(let i=0;i<Math.min(N,maxNodes);i++){if(!visit())break;const [x,y]=hilbertXY(n,i),here=[-0.83+1.66*(x+.5)/n,-.83+1.66*(y+.5)/n];if(prev&&intersects([prev,here],viewport)){segment(prev,here,p.level);painted++;}prev=here;}
 }else if(p.type==='tree'){
  const stack=[[[0,.87],[0,.2],0,.115]],angle=p.angle*Math.PI/180;
  while(stack.length){if(!visit())break;const[a,b,d,w]=stack.pop(),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!intersects([a,b],viewport,2*len))continue;
   branch(a,b,d,w);painted++;if(d===p.level||len*scale<minPixels){if(d<p.level)approximate++;continue;}
   for(const sgn of [1,-1]){const a2=angle*sgn,c=Math.cos(a2),s=Math.sin(a2),R=.69;stack.push([b,[b[0]+R*(dx*c-dy*s),b[1]+R*(dx*s+dy*c)],d+1,w*.73]);}
  }
 }else if(p.type==='pythagoras'){
  const stack=[[[ -.22,.79],[.22,.79],0]];const th=p.angle*Math.PI/180,co=Math.cos(th),si=Math.sin(th);
  while(stack.length){if(!visit())break;const[a,b,d]=stack.pop(),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),v=[dy,-dx],tl=[a[0]+v[0],a[1]+v[1]],tr=[b[0]+v[0],b[1]+v[1]];
   if(!intersects([a,b,tr,tl],viewport,len*1.5))continue;
   emitPolygon([a,b,tr,tl],d);if(d===p.level||len*scale<minPixels){if(d<p.level)approximate++;continue;}
   const apex=[tl[0]+co*co*dx+si*co*v[0],tl[1]+co*co*dy+si*co*v[1]];
   stack.push([apex,tr,d+1],[tl,apex,d+1]);
  }
 }else if(p.type==='fern'){
  let x=0,y=0,seed=1137757;const samples=FERN_SAMPLES[p.level],tot=Math.min(samples,maxNodes);
  for(let i=0;i<tot+20;i++){
   if(!visit())break;seed=(1664525*seed+1013904223)>>>0;const r=seed/4294967296;let nx,ny;
   if(r<.01){nx=0;ny=.16*y;}
   else if(r<.86){nx=.85*x+.04*y;ny=-.04*x+.85*y+1.6;}
   else if(r<.93){nx=.2*x-.26*y;ny=.23*x+.22*y+1.6;}
   else {nx=-.15*x+.28*y;ny=.26*x+.24*y+.44;}
   x=nx;y=ny;
   if(i<20)continue;const X=x*.31,Y=.83-y*.16;if(!viewport||(X>=viewport.x0&&X<=viewport.x1&&Y>=viewport.y0&&Y<=viewport.y1)){dot(X,Y,i/samples);painted++;}
  }
  if(samples>maxNodes)limited=true;
 }
 return {visited,painted,approximate,limited};
}
/** Complex quadratic maps: normalized world-coordinates, smooth iteration count. */
function escapePoint(kind,cx,cy,maxIter,juliaReal=-.74543,juliaImag=.11301){
 let zx,zy,cr,ci;
 if(kind==='julia'){zx=cx;zy=cy;cr=juliaReal;ci=juliaImag;}else{zx=0;zy=0;cr=cx;ci=cy;}
 for(let i=0;i<maxIter;i++){
  const ax=kind==='burning_ship'?Math.abs(zx):zx,ay=kind==='burning_ship'?Math.abs(zy):zy;
  const nextX=ax*ax-ay*ay+cr,nextY=(kind==='tricorn'?-2:2)*ax*ay+ci;
  zx=nextX;zy=nextY;const radius=zx*zx+zy*zy;
  if(radius>256){const m=Math.sqrt(radius),smooth=i+1-Math.log2(Math.max(1,Math.log2(m)));return {inside:false,value:Math.max(0,smooth),iterations:i+1};}
 }
 return {inside:true,value:0,iterations:maxIter};
}


export {TYPES,PALETTES,DEFAULTS,normalise,stats,walkFractal,escapePoint,ESCAPE_TYPES};
export const FRACTAL_ID="math.geometry.fractals-2d";
export const FRACTAL_SCHEMA={type:"object",additionalProperties:false,properties:{
type:{type:"string",enum:Object.keys(TYPES)},level:{type:"integer",minimum:0,maximum:18},
ratio:{type:"number",minimum:.2,maximum:.65},gridSize:{type:"integer",minimum:3,maximum:6},
angle:{type:"number",minimum:20,maximum:80},speed:{type:"number",minimum:.25,maximum:4},
palette:{type:"string",enum:PALETTES},showGrid:{type:"boolean"},outlines:{type:"boolean"},gradient:{type:"boolean"},
glow:{type:"number",minimum:0,maximum:100},hueShift:{type:"number",minimum:0,maximum:360},lightAngle:{type:"number",minimum:0,maximum:360},
detail:{type:"number",minimum:.5,maximum:1.5},juliaReal:{type:"number",minimum:-2,maximum:2},juliaImag:{type:"number",minimum:-2,maximum:2}
}};
export function createFractalModel(initial={}){
 let parameters={...DEFAULTS},elapsedSeconds=0,stepPhase=0;
 function snapshot(){return {simulationId:FRACTAL_ID,parameters:{...parameters},elapsedSeconds,timeSeconds:elapsedSeconds,metrics:stats(parameters),stepPhase};}
 function configure(patch){const next={...patch};if(next.type&&next.type!==parameters.type&&next.level===undefined)next.level=TYPES[next.type]?.initial;parameters=normalise(parameters,next);return snapshot();}
 function reset(){parameters={...DEFAULTS};elapsedSeconds=0;stepPhase=0;return snapshot();}
 function checkpoint(){return {parameters:{...parameters},elapsedSeconds,stepPhase};}
 function restore(saved){if(!saved||typeof saved!=="object")throw new TypeError("Invalid checkpoint");
 const p=normalise(DEFAULTS,saved.parameters);
 if(!Number.isFinite(saved.elapsedSeconds)||saved.elapsedSeconds<0||saved.elapsedSeconds>120||!Number.isFinite(saved.stepPhase)||saved.stepPhase<0||saved.stepPhase>=.7)throw new RangeError("Invalid checkpoint time");
 parameters=p;elapsedSeconds=saved.elapsedSeconds;stepPhase=saved.stepPhase;return snapshot();}
 function advance(seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>2)throw new RangeError("Invalid simulation step");
 elapsedSeconds+=seconds;const accumulated=stepPhase+seconds*parameters.speed;
 const count=Math.floor((accumulated+1e-10)/.7);stepPhase=Math.max(0,accumulated-count*.7);
 parameters={...parameters,level:Math.min(TYPES[parameters.type].max,parameters.level+count)};return snapshot();}
 if(Object.keys(initial).length)configure(initial);
 return {getParameters:()=>({...parameters}),configure,reset,advance,step:advance,snapshot,checkpoint,restore,trajectory:()=>[]};
}