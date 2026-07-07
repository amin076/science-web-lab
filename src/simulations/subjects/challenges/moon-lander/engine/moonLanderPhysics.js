import {
  DEFAULT_MOON_LANDER_INPUT,
  MOON_LANDER_STATUS,
  cloneJson,
} from "./defaults";

const TERMINAL_STATUSES = new Set([
  MOON_LANDER_STATUS.LANDED,
  MOON_LANDER_STATUS.CRASHED,
]);

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function normalizeAngle(degrees) {
  let angle = degrees;

  while (angle > 180) {
    angle -= 360;
  }

  while (angle < -180) {
    angle += 360;
  }

  return angle;
}

export function normalizeMoonLanderInput(input = {}) {
  return {
    ...DEFAULT_MOON_LANDER_INPUT,
    ...input,
    mainThrust: Boolean(input.mainThrust),
    rotateLeft: Boolean(input.rotateLeft),
    rotateRight: Boolean(input.rotateRight),
  };
}

export function getLandingMetrics(state) {
  const { lander, time } = state;
  const verticalSpeed = Math.abs(lander.velocity.y);
  const horizontalSpeed = Math.abs(lander.velocity.x);
  const landingSpeed = Math.sqrt(
    lander.velocity.x * lander.velocity.x + lander.velocity.y * lander.velocity.y
  );

  return {
    verticalSpeed,
    horizontalSpeed,
    landingSpeed,
    tilt: Math.abs(normalizeAngle(lander.angle)),
    fuelRemaining: lander.fuel,
    time,
  };
}

export function evaluateMoonLanderOutcome(state, mission) {
  const { lander } = state;
  const { landingPad, thresholds, world } = mission;

  if (lander.position.x < world.minX || lander.position.x > world.maxX) {
    return {
      status: MOON_LANDER_STATUS.CRASHED,
      reason: "outOfBounds",
    };
  }

  if (lander.position.y > world.groundY) {
    return null;
  }

  const metrics = getLandingMetrics(state);
  const padMinX = landingPad.x - landingPad.width / 2;
  const padMaxX = landingPad.x + landingPad.width / 2;
  const isOnPad = lander.position.x >= padMinX && lander.position.x <= padMaxX;

  if (!isOnPad) {
    return {
      status: MOON_LANDER_STATUS.CRASHED,
      reason: "missedPad",
      metrics,
    };
  }

  if (metrics.verticalSpeed > thresholds.maxVerticalSpeed) {
    return {
      status: MOON_LANDER_STATUS.CRASHED,
      reason: "verticalSpeed",
      metrics,
    };
  }

  if (metrics.horizontalSpeed > thresholds.maxHorizontalSpeed) {
    return {
      status: MOON_LANDER_STATUS.CRASHED,
      reason: "horizontalSpeed",
      metrics,
    };
  }

  if (metrics.tilt > thresholds.maxTilt) {
    return {
      status: MOON_LANDER_STATUS.CRASHED,
      reason: "tilt",
      metrics,
    };
  }

  return {
    status: MOON_LANDER_STATUS.LANDED,
    reason: "safeLanding",
    metrics,
  };
}

export function stepMoonLanderPhysics(state, input, deltaTime, mission) {
  if (
    TERMINAL_STATUSES.has(state.status) ||
    state.status === MOON_LANDER_STATUS.PAUSED
  ) {
    return { state: cloneJson(state), outcome: null };
  }

  const dt = clamp(deltaTime, 0, mission.physics.maxDeltaTime);
  const normalizedInput = normalizeMoonLanderInput(input);
  const next = cloneJson(state);
  const { lander } = next;

  next.status = MOON_LANDER_STATUS.RUNNING;
  next.time += dt;
  next.input = normalizedInput;

  const hasFuel = lander.fuel > 0;
  const thrustActive = normalizedInput.mainThrust && hasFuel;
  const turnDirection =
    Number(normalizedInput.rotateRight) - Number(normalizedInput.rotateLeft);
  const angleRadians = degreesToRadians(lander.angle);
  const thrustAcceleration = thrustActive
    ? mission.physics.thrustAcceleration
    : 0;

  lander.acceleration.x = Math.sin(angleRadians) * thrustAcceleration;
  lander.acceleration.y =
    Math.cos(angleRadians) * thrustAcceleration - mission.gravity;

  lander.velocity.x += lander.acceleration.x * dt;
  lander.velocity.y += lander.acceleration.y * dt;
  lander.position.x += lander.velocity.x * dt;
  lander.position.y += lander.velocity.y * dt;

  if (turnDirection !== 0 && hasFuel) {
    lander.angularVelocity +=
      turnDirection * mission.physics.rotationAcceleration * dt;
  } else {
    lander.angularVelocity *= mission.physics.angularDamping;
  }

  lander.angularVelocity = clamp(
    lander.angularVelocity,
    -mission.physics.maxAngularVelocity,
    mission.physics.maxAngularVelocity
  );
  lander.angle = normalizeAngle(lander.angle + lander.angularVelocity * dt);

  const fuelUsed =
    (thrustActive ? mission.physics.fuelConsumptionRate * dt : 0) +
    (Math.abs(turnDirection) > 0
      ? mission.physics.rotationFuelConsumptionRate * dt
      : 0);
  lander.fuel = clamp(lander.fuel - fuelUsed, 0, lander.fuelCapacity);

  if (lander.position.y <= mission.world.groundY) {
    lander.position.y = mission.world.groundY;
  }

  const outcome = evaluateMoonLanderOutcome(next, mission);

  if (outcome) {
    next.status = outcome.status;
  }

  return { state: next, outcome };
}
