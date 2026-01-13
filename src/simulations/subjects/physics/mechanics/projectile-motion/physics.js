// src/simulations/subjects/physics/mechanics/projectile-motion/utils/physics.js

export const calculatePhysicsStep = (objects, dt, gravity, airResistance) => {
  // --- WORLD LIMITS (Meters) ---
  const MIN_X = -500;
  const MAX_X = 500;
  const MIN_Y = 0;
  const MAX_Y = 500;

  const nextObjects = objects.map((obj) => ({ ...obj }));
  const trailUpdates = [];

  nextObjects.forEach((obj) => {
    // If already stopped, skip physics updates
    if (obj.stopped) return;

    let fx = 0;
    let fy = 0;

    // 1. Forces
    if (obj.type !== 'car') fy -= obj.mass * gravity; // Gravity
    
    if (airResistance > 0) {
      fx -= airResistance * obj.vx * obj.mass;
      fy -= airResistance * obj.vy * obj.mass;
    }

    if (obj.type === 'car') fx += obj.mass * obj.ax;

    // 2. Integration
    const ax = fx / obj.mass;
    const ay = fy / obj.mass;

    obj.vx += ax * dt;
    obj.vy += ay * dt;
    obj.x += obj.vx * dt;
    obj.y += obj.vy * dt;

    // --- BOUNDARY CHECKS & STOPPING LOGIC ---

    // A. Ground Collision (Stop Ball)
    if (obj.y <= MIN_Y) {
      obj.y = MIN_Y;
      if (obj.type === 'ball') {
        // Stop completely
        obj.vx = 0;
        obj.vy = 0;
        obj.stopped = true; 
      } else {
        // Car just stays on floor
        obj.vy = 0; 
      }
    }

    // B. Ceiling Collision
    if (obj.y >= MAX_Y) {
      obj.y = MAX_Y;
      obj.vy = 0; 
    }

    // C. Wall Limits (Stop Everything)
    if (obj.x >= MAX_X) {
      obj.x = MAX_X;
      obj.vx = 0;
      obj.stopped = true; // Stop simulation for this object
    } else if (obj.x <= MIN_X) {
      obj.x = MIN_X;
      obj.vx = 0;
      obj.stopped = true; // Stop simulation for this object
    }

    // D. Trail Collection (Only if moving)
    if (obj.id === 'ball' && !obj.stopped) {
      trailUpdates.push({ x: obj.x, y: obj.y });
    }
  });

  return { updatedObjects: nextObjects, newTrails: trailUpdates };
};