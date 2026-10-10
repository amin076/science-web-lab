import { constantAccelerationStep, uniformGravity, kineticEnergy, ESBIKO_PHYSICS_VERSION } from '../../../esbiko-physics/index.js';
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
});
export const defaultProjectileParameters = Object.freeze({launchSpeed:30,angleDeg:45,launchHeight:0,gravity:9.81,speed:1,zoom:1,panX:0,panY:0,grid:true,hudVisible:true});
export const physicsKeys = ['launchSpeed','angleDeg','launchHeight','gravity'];
export function validateProjectilePatch(patch) {
  if(!patch || typeof patch!=='object' || Array.isArray(patch))throw new TypeError('Parameters must be an object');
  for(const [key,value] of Object.entries(patch)) {
    const r=projectileParameters[key];
    if(!r || typeof value!==r.type || (r.type==='number' && (!Number.isFinite(value)||value<r.minimum||value>r.maximum)))throw new RangeError('Invalid parameter: '+key);
  }
  return {...patch};
}
export function projectileFlight(p) {
  validateProjectilePatch(p);
  const radians=p.angleDeg*Math.PI/180, vx=p.launchSpeed*Math.cos(radians),vy=p.launchSpeed*Math.sin(radians);
  const duration=(vy+Math.sqrt(vy*vy+2*p.gravity*p.launchHeight))/p.gravity;
  return {vx,vy,duration,range:vx*duration,maxHeight:p.launchHeight+vy*vy/(2*p.gravity)};
}
/** Exact uniform-g, vacuum trajectory through Esbiko Physics; point mass 1 kg, no bounce. */
export function sampleProjectile(time,p=defaultProjectileParameters) {
  if(!Number.isFinite(time)||time<0)throw new RangeError('Invalid time');
  const flight=projectileFlight(p),t=Math.min(time,flight.duration);
  const {position,velocity}=constantAccelerationStep({position:[0,p.launchHeight,0],velocity:[flight.vx,flight.vy,0]},t,uniformGravity(p.gravity));
  const landed=t>=flight.duration;
  return {time:t,x:position[0],y:landed?0:position[1],vx:velocity[0],vy:velocity[1],landed,
    kineticEnergyJ:kineticEnergy(velocity,1),potentialEnergyJ:p.gravity*Math.max(0,position[1]),
    flightTime:flight.duration,range:flight.range,maxHeight:flight.maxHeight,
    engine:'Esbiko Physics',engineVersion:ESBIKO_PHYSICS_VERSION,
    units:{time:'s',x:'m',y:'m',vx:'m/s',vy:'m/s',energy:'J'},
    velocityConvention:'pre-impact velocity at touchdown; contact impulse is not modeled'};
}
export function advanceProjectile(state,dt,p) {
  if(!Number.isFinite(dt)||dt<0)throw new RangeError('Invalid timestep');
  return sampleProjectile(state.time+Math.min(dt,0.05)*p.speed,p);
}
