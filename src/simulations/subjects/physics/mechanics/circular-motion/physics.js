export const integratePhysics = (prevState, params, dt) => {
  // Update Angular Velocity
  const omega = prevState.omega + params.alpha * dt;

  // Update Angle (integrate omega)
  const theta = prevState.theta + omega * dt;

  // Position
  const x = params.radius * Math.cos(theta);
  const y = params.radius * Math.sin(theta);

  // Velocity (Tangential)
  const v = params.radius * omega;
  const vx = -v * Math.sin(theta);
  const vy = v * Math.cos(theta);

  // Acceleration
  const ac = params.radius * omega * omega; // Centripetal
  const at = params.radius * params.alpha;  // Tangential
  const aTotal = Math.hypot(ac, at);

  // Period (T = 2*PI / omega)
  // If omega is near 0, Period is Infinity
  const period = Math.abs(omega) > 0.0001 ? (2 * Math.PI) / Math.abs(omega) : Infinity;

  return {
    t: prevState.t + dt,
    theta,
    omega,
    x,
    y,
    v,
    vx,
    vy,
    a: aTotal,
    period, // <--- New Data
    force: params.mass * aTotal,
  };
};

export const getInitialState = (params) => {
  const omega = params.omega0;
  return {
    t: 0,
    theta: params.theta0,
    omega: omega,
    x: params.radius * Math.cos(params.theta0),
    y: params.radius * Math.sin(params.theta0),
    v: 0,
    vx: 0,
    vy: 0,
    a: 0,
    period: Math.abs(omega) > 0.0001 ? (2 * Math.PI) / Math.abs(omega) : Infinity,
    force: 0,
  };
};