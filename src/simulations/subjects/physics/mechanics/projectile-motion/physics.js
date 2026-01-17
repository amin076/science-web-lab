// src/simulations/subjects/physics/mechanics/projectile-motion/physics.js

export const calculatePhysicsStep = (objects, dt, gravity, airResistance) => {
  // --- UPDATED LIMITS ---
  const MIN_X = -500;
  const MAX_X = 500;
  const MIN_Y = 0;
  const MAX_Y = 500;

  let limitReached = false; // Flag to trigger global pause

  // Find the plane to sync the parcel if attached
  const plane = objects.find((o) => o.id === "plane");

  const nextObjects = objects.map((obj) => {
    // CLONE OBJECT
    const newObj = { ...obj };

    // --- 1. HANDLE PARCEL ATTACHMENT ---
    if (newObj.id === "parcel" && newObj.attached && plane) {
      // Sync strictly with plane
      newObj.x = plane.x;
      newObj.y = plane.y - 2;
      newObj.vx = plane.vx;
      newObj.vy = 0;
      newObj.ax = plane.ax;
      newObj.stopped = plane.stopped;
      return newObj;
    }

    // --- 2. STANDARD PHYSICS ---
    if (newObj.stopped) return newObj;

    let fx = 0;
    let fy = 0;

    // Forces
    if (newObj.type !== "car" && newObj.type !== "plane") {
      fy -= newObj.mass * gravity;
    }

    // Drag
    if (airResistance > 0) {
      fx -= airResistance * newObj.vx * newObj.mass;
      fy -= airResistance * newObj.vy * newObj.mass;
    }

    // Engine Acceleration (Car & Plane)
    if (newObj.type === "car" || newObj.type === "plane") {
      fx += newObj.mass * newObj.ax;
    }

    // Integration
    const ax = fx / newObj.mass;
    const ay = fy / newObj.mass;

    newObj.vx += ax * dt;
    newObj.vy += ay * dt;
    newObj.x += newObj.vx * dt;
    newObj.y += newObj.vy * dt;

    // --- 3. COLLISIONS & LIMITATIONS ---

    // Floor (Y = 0)
    if (newObj.y <= MIN_Y) {
      newObj.y = MIN_Y;

      if (newObj.type === "car") {
        newObj.vy = 0;
      } else {
        newObj.vx = 0;
        newObj.vy = 0;
        newObj.stopped = true;
        // Note: Hitting the ground (Y=0) is usually "safe" for balls/parcels,
        // so we don't set limitReached = true here unless it's the plane crashing.
        if (newObj.type === "plane") limitReached = true;
      }
    }

    // Ceiling (Y Max)
    if (newObj.y >= MAX_Y) {
      newObj.y = MAX_Y;
      newObj.vy = 0;
      newObj.stopped = true;
      limitReached = true; // Stop simulation on ceiling hit
    }

    // Walls (X Limits)
    if (newObj.x >= MAX_X) {
      newObj.x = MAX_X;
      newObj.vx = 0;
      newObj.stopped = true;
      limitReached = true; // Stop simulation on wall hit
    } else if (newObj.x <= MIN_X) {
      newObj.x = MIN_X;
      newObj.vx = 0;
      newObj.stopped = true;
      limitReached = true; // Stop simulation on wall hit
    }

    return newObj;
  });

  // --- 4. TRAIL GENERATION ---
  const trailUpdates = [];
  nextObjects.forEach((obj) => {
    if (
      (obj.id === "ball" || (obj.id === "parcel" && !obj.attached)) &&
      !obj.stopped
    ) {
      trailUpdates.push({ id: obj.id, x: obj.x, y: obj.y });
    }
  });

  return { updatedObjects: nextObjects, newTrails: trailUpdates, limitReached };
};
