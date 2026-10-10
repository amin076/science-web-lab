import { vector3, positive, finite } from '../math/vector3.js';
import { velocityVerletStep } from './integrators.js';
/** Headless one-particle, position-only force model. No browser/React dependencies.
 * Callback must be pure and return acceleration in m/s²; model does not serialize callbacks.
 */
export function createParticleModel({position,velocity,dtSeconds=1/120,accelerationAt}) {
  const initial={position:vector3(position),velocity:vector3(velocity)};
  positive(dtSeconds,'dtSeconds');
  if(typeof accelerationAt!=='function')throw new TypeError('accelerationAt required');
  let state=structuredClone(initial),ticks=0,disposed=false;
  const active=()=>{if(disposed)throw new Error('MODEL_DISPOSED');};
  const snapshot=()=>{active();return {modelVersion:'0.1.0',timeSeconds:ticks*dtSeconds,steps:ticks,dtSeconds,units:{position:'m',velocity:'m/s'},...structuredClone(state)};};
  return {
    snapshot,
    step(steps=1) {
      active();
      if(!Number.isInteger(steps)||steps<0||steps>10000)throw new RangeError('steps must be integer 0..10000');
      if(!Number.isSafeInteger(ticks+steps))throw new RangeError('step counter overflow');
      // Transactional batch: a failed field evaluation leaves state and time unchanged.
      let next=structuredClone(state);
      for(let i=0;i<steps;i++)next=velocityVerletStep(next,dtSeconds,accelerationAt);
      finite((ticks+steps)*dtSeconds,'timeSeconds');
      state=next;ticks+=steps;return snapshot();
    },
    reset(){active();state=structuredClone(initial);ticks=0;return snapshot();},
    dispose(){disposed=true;state=null;},
  };
}
