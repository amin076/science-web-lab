// src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.constants.js

export const ASSETS = {
  EARTH_TEXTURE: "/textures/earth/EarthPolar.jpg",
  MOON_TEXTURE: "/textures/moon.jpg",
};

export const VIEW_MODES = {
  EDUCATIONAL: "EDUCATIONAL",
  REALISTIC: "REALISTIC",
};

export const MOON = {
  radiusKm: 1737,
  orbitRadiusKm: 384400,
  periodSec: 27.321661 * 24 * 3600,
};

export const ORBIT_PRESETS = {
  ISS: 408,
  HUBBLE: 540,
  LEO: 1200,
  MEO: 20200,
  GEO: 35786,
  JWST: 1500000, // L2 Point (1.5 Million km)
  MOON: 384400,
};

export const COLORS = {
  ISS: "#FFFFFF",
  HUBBLE: "#A0C4FF", // Steel Blue
  JWST: "#FFD700", // Gold
  LEO: "#00B0FF",
  MEO: "#FFAB00",
  GEO: "#00E676",
  MOON: "#DDDDDD",
  ORBIT_LINE: "rgba(255, 255, 255, 0.15)",
};

export const RENDER = {
  TRAIL_MAX_LENGTH: 800,
  TRAIL_ALPHA: 0.5,
  STARS_COUNT: 800,
  STARS_AREA: 10000,
  EARTH_SCALE: 0.28,
  VECTOR_SCALE: 1.0,
};

export const SATELLITE_CONFIGS = {
  ISS: {
    alt: 408,
    type: "ISS",
    name: "International Space Station",
    color: COLORS.ISS,
  },
  HUBBLE: {
    alt: 540,
    type: "HUBBLE",
    name: "Hubble Space Telescope",
    color: COLORS.HUBBLE,
  },
  JWST: {
    alt: 1500000,
    type: "JWST",
    name: "James Webb Space Telescope",
    color: COLORS.JWST,
  },
  LEO: {
    alt: 1200,
    type: "satellite",
    name: "LEO Satellite",
    color: COLORS.LEO,
  },
  MEO: {
    alt: 20200,
    type: "satellite",
    name: "MEO Satellite",
    color: COLORS.MEO,
  },
  GEO: {
    alt: 35786,
    type: "satellite",
    name: "GEO Satellite",
    color: COLORS.GEO,
  },
};

// ✅ NEW: Educational Data for HUD
export const OBJECT_INFO = {
  EARTH: {
    title: "Earth",
    subtitle: "Home Planet",
    description:
      "The third planet from the Sun and the only astronomical object known to harbor life. Earth has a dense atmosphere and a magnetic field that protects it from solar radiation.",
    stats: [
      { label: "Radius", value: "6,371 km" },
      { label: "Day Length", value: "23h 56m 4s" },
      { label: "Axial Tilt", value: "23.5°" },
      { label: "Surface Gravity", value: "9.8 m/s²" },
    ],
  },
  MOON: {
    title: "The Moon",
    subtitle: "Earth's Natural Satellite",
    description:
      "Earth's only natural satellite. It is tidally locked, meaning the same side always faces Earth. It significantly influences Earth's tides and stabilizes our planet's axial wobble.",
    stats: [
      { label: "Radius", value: "1,737 km" },
      { label: "Orbital Period", value: "27.3 days" },
      { label: "Avg Distance", value: "384,400 km" },
      { label: "Gravity", value: "1.62 m/s²" },
    ],
  },
  ISS: {
    title: "International Space Station",
    subtitle: "Habitable Artificial Satellite",
    description:
      "A modular space station in low Earth orbit. It is a multinational collaborative project involving NASA, Roscosmos, JAXA, ESA, and CSA. It serves as a microgravity and space environment research laboratory.",
    stats: [
      { label: "Launch Date", value: "Nov 1998" },
      { label: "Speed", value: "~7.66 km/s" },
      { label: "Orbital Period", value: "~93 min" },
      { label: "Crew Capacity", value: "7 Astronauts" },
    ],
  },
  HUBBLE: {
    title: "Hubble Space Telescope",
    subtitle: "Low Earth Orbit Telescope",
    description:
      "One of the largest and most versatile space telescopes. Observing in the visible, near-ultraviolet, and near-infrared spectra, it has provided some of the most detailed images of deep space ever recorded.",
    stats: [
      { label: "Launch Date", value: "Apr 1990" },
      { label: "Orbit Type", value: "Low Earth (LEO)" },
      { label: "Mirror Diameter", value: "2.4 meters" },
      { label: "Wavelengths", value: "UV, Visible, NIR" },
    ],
  },
  JWST: {
    title: "James Webb Space Telescope",
    subtitle: "Infrared Astronomy Observatory",
    description:
      "The successor to Hubble, JWST orbits the Sun at the Earth-Sun L2 Lagrange point, 1.5 million km away. It sees in infrared to peer through dust clouds and observe the early universe.",
    stats: [
      { label: "Launch Date", value: "Dec 2021" },
      { label: "Orbit Location", value: "Sun-Earth L2" },
      { label: "Mirror Diameter", value: "6.5 meters" },
      { label: "Operating Temp", value: "-223°C (50K)" },
    ],
  },
  GENERIC: {
    title: "Satellite",
    subtitle: "Artificial Orbiter",
    description:
      "An object intentionally placed into orbit. Common uses include communications (GEO), navigation (MEO - GPS), and earth observation (LEO).",
    stats: [],
  },
};