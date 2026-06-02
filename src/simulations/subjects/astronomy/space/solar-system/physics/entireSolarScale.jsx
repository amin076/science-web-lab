const calcOrbit = (a_au, e, scaleConstant) => {
  const a = a_au * scaleConstant;
  const b = a * Math.sqrt(1 - e * e);
  const c = a * e;
  return { orbitMajor: a, orbitMinor: b, focusOffset: c };
};

const MOON_ORBIT_PLANE = {
  earth: { inclination: 5.1, labelHeight: 0 },
  mars: { inclination: 25.2, labelHeight: 0 },
  jupiter: { inclination: 3.1, labelHeight: 0 },
  saturn: { inclination: 26.7, labelHeight: 0 },
  uranus: { inclination: 97.8, labelHeight: 0 },
  neptune: { inclination: 156.8, labelHeight: 0 },
};

// ==========================================
// 1. EDUCATIONAL
// ==========================================
const EDU_SCALE = 25;
export const ENTIRE_SOLAR_EDUCATIONAL = {
  sun: { radius: 5, rotation: 27 },
  mercury: {
    radius: 0.38,
    ...calcOrbit(0.387, 0.205, EDU_SCALE),
    inclination: 7.0,
    rotation: 58.6,
    year: 88,
    tilt: 0.03,
    atmosphereColor: "#a5a5a5",
    trailColor: "#b0bec5",
  },
  venus: {
    radius: 0.95,
    ...calcOrbit(0.723, 0.007, EDU_SCALE),
    inclination: 3.4,
    rotation: -243,
    year: 224.7,
    tilt: 177,
    atmosphereColor: "#e6dbb3",
    trailColor: "#fff59d",
  },
  earth: {
    radius: 0.8,
    ...calcOrbit(1.0, 0.0167, EDU_SCALE),
    inclination: 0,
    rotation: 1.0,
    year: 365,
    tilt: 23.5,
    atmosphereColor: "#4ca6ff",
    trailColor: "#4ca6ff",
  },
  moon: {
    radius: 0.22,
    orbitRadius: 2.5,
    period: 27.3,
    ...MOON_ORBIT_PLANE.earth,
    tidalLock: true,
    tidalLockOffset: -Math.PI / 2,
  },

  mars: {
    radius: 0.6,
    ...calcOrbit(1.524, 0.093, EDU_SCALE),
    inclination: 1.85,
    rotation: 1.03,
    year: 687,
    tilt: 25,

    atmosphereColor: "#ff5722",
    trailColor: "#ff8a50",
  },
  // 🆕 MARS MOONS (Educational)
  marsMoons: {
    phobos: {
      radius: 0.1,
      orbitRadius: 1.2,
      period: 0.3,
      color: "#8d8276",
      orbitColor: "#f59e0b",
      labelColor: "#f59e0b",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    },
    deimos: {
      radius: 0.08,
      orbitRadius: 1.8,
      period: 1.2,
      color: "#a59483",
      orbitColor: "#38bdf8",
      labelColor: "#38bdf8",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    },
  },

  jupiter: {
    radius: 2.5,
    ...calcOrbit(5.203, 0.048, EDU_SCALE),
    inclination: 1.3,
    rotation: 0.41,
    year: 4333,
    tilt: 3.1,
    atmosphereColor: "#e6c48e",
    trailColor: "#ffd54f",
  },
  jupiterMoons: {
    io: { radius: 0.15, orbitRadius: 3.5, period: 1.8, color: "#ffcc33", ...MOON_ORBIT_PLANE.jupiter },
    europa: { radius: 0.14, orbitRadius: 4.5, period: 3.5, color: "#d0e4ff", ...MOON_ORBIT_PLANE.jupiter },
    ganymede: { radius: 0.2, orbitRadius: 5.8, period: 7.2, color: "#c0b090", ...MOON_ORBIT_PLANE.jupiter },
    callisto: {
      radius: 0.18,
      orbitRadius: 7.0,
      period: 16.7,
      color: "#a1887f",
      ...MOON_ORBIT_PLANE.jupiter,
    },
  },

  saturn: {
    radius: 2.2,
    ...calcOrbit(9.537, 0.054, EDU_SCALE),
    inclination: 2.48,
    rotation: 0.45,
    year: 10759,
    tilt: 26.7,
    atmosphereColor: "#ead6b8",
    trailColor: "#ffe082",
    rings: { inner: 2.8, outer: 4.5, color: "#c5a16f" },
  },
  // 🆕 SATURN MOONS (Educational)
  saturnMoons: {
    titan: { radius: 0.4, orbitRadius: 6.0, period: 16, color: "#e3bb76", ...MOON_ORBIT_PLANE.saturn },
    enceladus: { radius: 0.1, orbitRadius: 3.5, period: 1.3, color: "#ffffff", ...MOON_ORBIT_PLANE.saturn },
  },

  uranus: {
    radius: 1.5,
    ...calcOrbit(19.191, 0.047, EDU_SCALE),
    inclination: 0.77,
    rotation: -0.72,
    year: 30685,
    tilt: 97.7,
    atmosphereColor: "#a7d1d6",
    trailColor: "#80deea",
  },
  // 🆕 URANUS MOONS (Educational)
  uranusMoons: {
    miranda: { radius: 0.08, orbitRadius: 2.2, period: 1.4, color: "#b9c7d6", ...MOON_ORBIT_PLANE.uranus },
    ariel: { radius: 0.12, orbitRadius: 3.0, period: 2.5, color: "#d8d8d8", ...MOON_ORBIT_PLANE.uranus },
    umbriel: { radius: 0.12, orbitRadius: 3.8, period: 4.1, color: "#8f8f8f", ...MOON_ORBIT_PLANE.uranus },
    titania: { radius: 0.16, orbitRadius: 4.8, period: 8.7, color: "#c7b7a3", ...MOON_ORBIT_PLANE.uranus },
    oberon: { radius: 0.15, orbitRadius: 5.8, period: 13.5, color: "#a89580", ...MOON_ORBIT_PLANE.uranus },
  },
  neptune: {
    radius: 1.4,
    ...calcOrbit(30.069, 0.009, EDU_SCALE),
    inclination: 1.77,
    rotation: 0.67,
    year: 60190,
    tilt: 28.3,
    atmosphereColor: "#5c81d6",
    trailColor: "#536dfe",
  },
  // 🆕 NEPTUNE MOONS (Educational)
  neptuneMoons: {
    triton: { radius: 0.25, orbitRadius: 3.5, period: -5.8, color: "#f4d6d6", ...MOON_ORBIT_PLANE.neptune }, // Negative = Retrograde
  },
};

// ==========================================
// 2. SEMI-REALISTIC
// ==========================================
const SEMI_SCALE = 100;
export const ENTIRE_SOLAR_SEMI_REALISTIC = {
  sun: { radius: 12, rotation: 27 },
  mercury: {
    radius: 0.38,
    ...calcOrbit(0.387, 0.205, SEMI_SCALE),
    inclination: 7.0,
    rotation: 58.6,
    year: 88,
    tilt: 0.03,
    atmosphereColor: "#a5a5a5",
    trailColor: "#b0bec5",
  },
  venus: {
    radius: 0.95,
    ...calcOrbit(0.723, 0.007, SEMI_SCALE),
    inclination: 3.4,
    rotation: -243,
    year: 224,
    tilt: 177,
    atmosphereColor: "#e6dbb3",
    trailColor: "#fff59d",
  },
  earth: {
    radius: 1.0,
    ...calcOrbit(1.0, 0.0167, SEMI_SCALE),
    inclination: 0,
    rotation: 1.0,
    year: 365,
    tilt: 23.5,
    atmosphereColor: "#4ca6ff",
    trailColor: "#4ca6ff",
  },
  moon: {
    radius: 0.27,
    orbitRadius: 4,
    period: 27.3,
    ...MOON_ORBIT_PLANE.earth,
    tidalLock: true,
    tidalLockOffset: -Math.PI / 2,
  },

  mars: {
    radius: 0.53,
    ...calcOrbit(1.524, 0.093, SEMI_SCALE),
    inclination: 1.85,
    rotation: 1.03,
    year: 687,
    tilt: 25,
    atmosphereColor: "#ff5722",
    trailColor: "#ff8a50",
  },
  marsMoons: {
    phobos: {
      radius: 0.15,
      orbitRadius: 1.5,
      period: 0.3,
      color: "#8d8276",
      orbitColor: "#f59e0b",
      labelColor: "#f59e0b",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    },
    deimos: {
      radius: 0.12,
      orbitRadius: 2.5,
      period: 1.2,
      color: "#a59483",
      orbitColor: "#38bdf8",
      labelColor: "#38bdf8",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    },
  },

  jupiter: {
    radius: 11.2,
    ...calcOrbit(5.203, 0.048, SEMI_SCALE),
    inclination: 1.3,
    rotation: 0.41,
    year: 4333,
    tilt: 3.1,
    atmosphereColor: "#e6c48e",
    trailColor: "#ffd54f",
  },
  jupiterMoons: {
    io: { radius: 0.28, orbitRadius: 15, period: 1.8, color: "#ffcc33", ...MOON_ORBIT_PLANE.jupiter },
    europa: { radius: 0.24, orbitRadius: 20, period: 3.5, color: "#d0e4ff", ...MOON_ORBIT_PLANE.jupiter },
    ganymede: { radius: 0.41, orbitRadius: 25, period: 7.2, color: "#c0b090", ...MOON_ORBIT_PLANE.jupiter },
    callisto: { radius: 0.37, orbitRadius: 35, period: 16.7, color: "#a1887f", ...MOON_ORBIT_PLANE.jupiter },
  },

  saturn: {
    radius: 9.45,
    ...calcOrbit(9.537, 0.056, SEMI_SCALE),
    inclination: 2.48,
    rotation: 0.45,
    year: 10759,
    tilt: 26.7,
    atmosphereColor: "#ead6b8",
    trailColor: "#ffe082",
    rings: { inner: 11, outer: 18, color: "#c5a16f" },
  },
  saturnMoons: {
    titan: { radius: 0.45, orbitRadius: 22, period: 16, color: "#e3bb76", ...MOON_ORBIT_PLANE.saturn },
    enceladus: { radius: 0.15, orbitRadius: 14, period: 1.3, color: "#ffffff", ...MOON_ORBIT_PLANE.saturn },
  },

  uranus: {
    radius: 4.0,
    ...calcOrbit(19.191, 0.046, SEMI_SCALE),
    inclination: 0.77,
    rotation: -0.72,
    year: 30685,
    tilt: 97.7,
    atmosphereColor: "#a7d1d6",
    trailColor: "#80deea",
  },
  // 🆕 URANUS MOONS (Semi-Realistic)
  uranusMoons: {
    miranda: { radius: 0.08, orbitRadius: 7, period: 1.4, color: "#b9c7d6", ...MOON_ORBIT_PLANE.uranus },
    ariel: { radius: 0.12, orbitRadius: 10, period: 2.5, color: "#d8d8d8", ...MOON_ORBIT_PLANE.uranus },
    umbriel: { radius: 0.12, orbitRadius: 13, period: 4.1, color: "#8f8f8f", ...MOON_ORBIT_PLANE.uranus },
    titania: { radius: 0.16, orbitRadius: 17, period: 8.7, color: "#c7b7a3", ...MOON_ORBIT_PLANE.uranus },
    oberon: { radius: 0.15, orbitRadius: 22, period: 13.5, color: "#a89580", ...MOON_ORBIT_PLANE.uranus },
  },
  neptune: {
    radius: 3.9,
    ...calcOrbit(30.069, 0.009, SEMI_SCALE),
    inclination: 1.77,
    rotation: 0.67,
    year: 60190,
    tilt: 28.3,
    atmosphereColor: "#5c81d6",
    trailColor: "#536dfe",
  },
  neptuneMoons: {
    triton: { radius: 0.35, orbitRadius: 10, period: -5.8, color: "#f4d6d6", ...MOON_ORBIT_PLANE.neptune },
  },
};

// ==========================================
// 3. REALISTIC
// ==========================================
const R_EARTH = 1;
const AU_REAL = 23455;

export const ENTIRE_SOLAR_REALISTIC = {
  sun: { radius: 109.2 * R_EARTH, rotation: 27 },
  mercury: {
    radius: 0.383 * R_EARTH,
    ...calcOrbit(0.387, 0.205, AU_REAL),
    inclination: 7.0,
    rotation: 58.6,
    year: 88,
    tilt: 0.03,
    atmosphereColor: "#a5a5a5",
    trailColor: "#b0bec5",
  },
  venus: {
    radius: 0.949 * R_EARTH,
    ...calcOrbit(0.723, 0.007, AU_REAL),
    inclination: 3.4,
    rotation: -243,
    year: 224.7,
    tilt: 177.3,
    atmosphereColor: "#e6dbb3",
    trailColor: "#fff59d",
  },
  earth: {
    radius: 1.0 * R_EARTH,
    ...calcOrbit(1.0, 0.017, AU_REAL),
    inclination: 0,
    rotation: 1.0,
    year: 365.2,
    tilt: 23.5,
    atmosphereColor: "#4ca6ff",
    trailColor: "#4ca6ff",
  },
  moon: {
    radius: 0.273 * R_EARTH,
    orbitRadius: 60.3 * R_EARTH,
    period: 27.3,
    ...MOON_ORBIT_PLANE.earth,
    tidalLock: true,
    tidalLockOffset: -Math.PI / 2,
  },

  mars: {
    radius: 0.532 * R_EARTH,
    ...calcOrbit(1.524, 0.093, AU_REAL),
    inclination: 1.85,
    rotation: 1.03,
    year: 687,
    tilt: 25.2,
    atmosphereColor: "#ff5722",
    trailColor: "#ff8a50",
  },
  marsMoons: {
    phobos: {
      radius: 0.01 * R_EARTH,
      orbitRadius: 2.5 * R_EARTH,
      period: 0.3,
      color: "#8d8276",
      orbitColor: "#f59e0b",
      labelColor: "#f59e0b",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    }, // Approx
    deimos: {
      radius: 0.005 * R_EARTH,
      orbitRadius: 3.5 * R_EARTH,
      period: 1.2,
      color: "#a59483",
      orbitColor: "#38bdf8",
      labelColor: "#38bdf8",
      labelSize: 0.11,
      labelOffset: [0, 0.18, 0],
      ...MOON_ORBIT_PLANE.mars,
    },
  },

  jupiter: {
    radius: 11.21 * R_EARTH,
    ...calcOrbit(5.203, 0.048, AU_REAL),
    inclination: 1.3,
    rotation: 0.41,
    year: 4333,
    tilt: 3.1,
    atmosphereColor: "#e6c48e",
    trailColor: "#ffd54f",
  },
  jupiterMoons: {
    io: {
      radius: 0.28 * R_EARTH,
      orbitRadius: 66.2 * R_EARTH,
      period: 1.77,
      color: "#ffcc33",
      ...MOON_ORBIT_PLANE.jupiter,
    },
    europa: {
      radius: 0.24 * R_EARTH,
      orbitRadius: 105.3 * R_EARTH,
      period: 3.55,
      color: "#d0e4ff",
      ...MOON_ORBIT_PLANE.jupiter,
    },
    ganymede: {
      radius: 0.41 * R_EARTH,
      orbitRadius: 168.0 * R_EARTH,
      period: 7.15,
      color: "#c0b090",
      ...MOON_ORBIT_PLANE.jupiter,
    },
    callisto: {
      radius: 0.37 * R_EARTH,
      orbitRadius: 295.5 * R_EARTH,
      period: 16.69,
      color: "#a1887f",
      ...MOON_ORBIT_PLANE.jupiter,
    },
  },

  saturn: {
    radius: 9.45 * R_EARTH,
    ...calcOrbit(9.537, 0.054, AU_REAL),
    inclination: 2.48,
    rotation: 0.45,
    year: 10759,
    tilt: 26.7,
    atmosphereColor: "#ead6b8",
    trailColor: "#ffe082",
    rings: { inner: 9.45 * 1.5, outer: 9.45 * 2.3, color: "#c5a16f" },
  },
  saturnMoons: {
    titan: {
      radius: 0.4 * R_EARTH,
      orbitRadius: 190.0 * R_EARTH,
      period: 16,
      color: "#e3bb76",
      ...MOON_ORBIT_PLANE.saturn,
    },
    enceladus: {
      radius: 0.04 * R_EARTH,
      orbitRadius: 37.0 * R_EARTH,
      period: 1.3,
      color: "#ffffff",
      ...MOON_ORBIT_PLANE.saturn,
    },
  },

  uranus: {
    radius: 4.01 * R_EARTH,
    ...calcOrbit(19.191, 0.047, AU_REAL),
    inclination: 0.77,
    rotation: -0.72,
    year: 30685,
    tilt: 97.8,
    atmosphereColor: "#a7d1d6",
    trailColor: "#80deea",
  },
  //uranus moons (Realistic)
  uranusMoons: {
    miranda: {
      radius: 0.037 * R_EARTH,
      orbitRadius: 32 * R_EARTH,
      period: 1.41,
      color: "#b9c7d6",
      ...MOON_ORBIT_PLANE.uranus,
    },
    ariel: {
      radius: 0.091 * R_EARTH,
      orbitRadius: 53 * R_EARTH,
      period: 2.52,
      color: "#d8d8d8",
      ...MOON_ORBIT_PLANE.uranus,
    },
    umbriel: {
      radius: 0.092 * R_EARTH,
      orbitRadius: 74 * R_EARTH,
      period: 4.14,
      color: "#8f8f8f",
      ...MOON_ORBIT_PLANE.uranus,
    },
    titania: {
      radius: 0.124 * R_EARTH,
      orbitRadius: 109 * R_EARTH,
      period: 8.71,
      color: "#c7b7a3",
      ...MOON_ORBIT_PLANE.uranus,
    },
    oberon: {
      radius: 0.119 * R_EARTH,
      orbitRadius: 146 * R_EARTH,
      period: 13.46,
      color: "#a89580",
      ...MOON_ORBIT_PLANE.uranus,
    },
  },
  neptune: {
    radius: 3.88 * R_EARTH,
    ...calcOrbit(30.069, 0.009, AU_REAL),
    inclination: 1.77,
    rotation: 0.67,
    year: 60190,
    tilt: 28.3,
    atmosphereColor: "#5c81d6",
    trailColor: "#536dfe",
  },
  neptuneMoons: {
    triton: {
      radius: 0.21 * R_EARTH,
      orbitRadius: 55.0 * R_EARTH,
      period: -5.8,
      color: "#f4d6d6",
      ...MOON_ORBIT_PLANE.neptune,
    },
  },
};
