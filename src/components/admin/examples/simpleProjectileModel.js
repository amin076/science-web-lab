import { initialProjectile, advanceProjectileState, projectileMeasurements, vacuumFlight, ESBIKO_PHYSICS_VERSION } from '../../../esbiko-physics/index.js';
export const projectileParameters = Object.freeze({
  launchSpeed: { type: 'number', minimum: 5, maximum: 80 },
  angleDeg: { type: 'number', minimum: 5, maximum: 85 },
  launchHeight: { type: 'number', minimum: 0, maximum: 30 },
  gravity: { type: 'number', minimum: 1, maximum: 30 },
  speed: { type: 'number', minimum: 0.1, maximum: 4 },
  zoom: { type: 'number', minimum: 0.5, maximum: 3 },
  panX: { type: 'number', minimum: -10, maximum: 10 },
  panY: { type: 'number', minimum: -10, maximum: 10 },
  grid: { type: 'boolean' }, hudVisible: { type: 'boolean' },
  velocityVector: { type: 'boolean' }, velocityComponents: { type: 'boolean' }, airResistance: { type: 'boolean' },
  massKg: { type: 'number', minimum: 0.1, maximum: 10 },
  radiusM: { type: 'number', minimum: 0.01, maximum: 0.2 },
  airDensity: { type: 'number', minimum: 0, maximum: 2 },
  dragCoefficient: { type: 'number', minimum: 0, maximum: 1.2 },
});
export const defaultProjectileParameters = Object.freeze({launchSpeed:30,angleDeg:45,launchHeight:0,gravity:9.81,speed:1,zoom:1,panX:0,panY:0,grid:true,hudVisible:true,velocityVector:true,velocityComponents:true,airResistance:false,massKg:1,radiusM:0.05,airDensity:1.225,dragCoefficient:0.47});
export const physicsKeys = ['launchSpeed','angleDeg','launchHeight','gravity','airResistance','massKg','radiusM','airDensity','dragCoefficient'];
export function validateProjectilePatch(patch) {
  if(!patch || typeof patch!=='object' || Array.isArray(patch))throw new TypeError('Parameters must be an object');
  for(const [key,value] of Object.entries(patch)) {
    const r=projectileParameters[key];
    if(!r || typeof value!==r.type || (r.type==='number' && (!Number.isFinite(value)||value<r.minimum||value>r.maximum)))throw new RangeError('Invalid parameter: '+key);
  }
  return {...patch};
}
export function projectileFlight(p) { validateProjectilePatch(p);return vacuumFlight(p); }
function snapshot(state,p) {
  return {...projectileMeasurements(state,p),time:state.time,landed:state.landed,physicalState:state,
    flightTime:state.landed?state.time:null,range:state.landed?state.position[0]:null,maxHeight:state.peakHeight,
    engine:'Esbiko Physics',engineVersion:ESBIKO_PHYSICS_VERSION,
    units:{time:'s',x:'m',y:'m',vx:'m/s',vy:'m/s',speed:'m/s',energy:'J'},
    velocityConvention:'pre-impact velocity at touchdown; no contact impulse'};
}
export function sampleProjectile(time,p=defaultProjectileParameters) {
  if(!Number.isFinite(time)||time<0||time>1000)throw new RangeError('Time must be 0..1000 s');
  validateProjectilePatch(p);let state=initialProjectile(p);
  while(state.time<time-1e-9&&!state.landed)state=advanceProjectileState(state,Math.min(1,time-state.time),p);
  return snapshot(state,p);
}
export function advanceProjectile(state,dt,p) {
  validateProjectilePatch(p);if(!Number.isFinite(dt)||dt<0)throw new RangeError('Invalid timestep');
  return snapshot(advanceProjectileState(state.physicalState,Math.min(dt,0.05)*p.speed,p),p);
}
/** Presentation-only projection: equal pixels per metre on x/y; never changes physics. */
export function projectileCamera({width,height},p) {
  const bounds=projectileFlight(p);
  const scale=Math.min(Math.max(20,width-80)/Math.max(bounds.range,10),Math.max(20,height-100)/Math.max(bounds.maxHeight,5))*p.zoom;
  return {scale,originX:40+p.panX*scale,originY:height-50-p.panY*scale};
}
