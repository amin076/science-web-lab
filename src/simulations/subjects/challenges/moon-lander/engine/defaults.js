export const MOON_LANDER_STATUS = {
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  LANDED: "landed",
  CRASHED: "crashed",
};

export const DEFAULT_MOON_LANDER_INPUT = {
  mainThrust: false,
  rotateLeft: false,
  rotateRight: false,
};

export const DEFAULT_MOON_LANDER_MISSION = {
  id: "training-pad-01",
  name: "Training Pad",
  gravity: 1.62,
  world: {
    minX: 0,
    maxX: 900,
    groundY: 0,
    ceilingY: 560,
  },
  landingPad: {
    x: 680,
    width: 140,
  },
  thresholds: {
    maxVerticalSpeed: 3,
    maxHorizontalSpeed: 2,
    maxTilt: 8,
  },
  lander: {
    position: { x: 180, y: 380 },
    velocity: { x: 8, y: 0 },
    acceleration: { x: 0, y: -1.62 },
    angle: 0,
    angularVelocity: 0,
    fuel: 100,
    fuelCapacity: 100,
    dryMass: 1,
  },
  physics: {
    thrustAcceleration: 5.4,
    rotationAcceleration: 90,
    maxAngularVelocity: 120,
    angularDamping: 0.985,
    fuelConsumptionRate: 9,
    rotationFuelConsumptionRate: 0,
    maxDeltaTime: 0.05,
  },
};

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeNested(base, override) {
  const result = cloneJson(base);

  Object.entries(override || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeNested(result[key], value);
      return;
    }

    result[key] = value;
  });

  return result;
}

export function createMoonLanderMission(overrides = {}) {
  return mergeNested(DEFAULT_MOON_LANDER_MISSION, overrides);
}

export function createInitialMoonLanderState(mission) {
  return {
    status: MOON_LANDER_STATUS.READY,
    time: 0,
    lander: cloneJson(mission.lander),
    mission: {
      id: mission.id,
      name: mission.name,
      gravity: mission.gravity,
      landingPad: cloneJson(mission.landingPad),
      thresholds: cloneJson(mission.thresholds),
      world: cloneJson(mission.world),
    },
    input: cloneJson(DEFAULT_MOON_LANDER_INPUT),
    result: null,
  };
}
