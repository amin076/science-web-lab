//src/simulations/subjects/physics/acoustics/Doppler/constants.js
export const SPEED_OF_SOUND = 343;
export const MAX_DISTANCE = 1000;
export const WAVE_EMIT_INTERVAL = 0.12;
export const MAX_WAVE_RADIUS = 200;

export const MODES = {
  SCIENTIFIC: "scientific",
  CAR: "car",
};

export const SOURCE_PRESETS = {
  city: {
    label: "City Car",
    v: 15,
    baseFreq: 220,
    instrument: "car_engine",
  },
  highway: {
    label: "Highway",
    v: 35,
    baseFreq: 300,
    instrument: "car_engine",
  },
  race: {
    label: "Race Car",
    v: 80,
    baseFreq: 420,
    instrument: "car_engine",
  },
  diesel: {
    label: "Diesel",
    v: 25,
    baseFreq: 230,
    instrument: "diesel_engine",
  },
  bus: {
    label: "Bus",
    v: 18,
    baseFreq: 200,
    instrument: "bus_engine",
  },
  tractor: {
    label: "Tractor",
    v: 10,
    baseFreq: 160,
    instrument: "tractor_engine",
  },
  ambulance: {
    label: "Ambulance",
    v: 45,
    baseFreq: 500,
    instrument: "ambulance_siren",
  },
  police: {
    label: "Police",
    v: 50,
    baseFreq: 520,
    instrument: "police_siren",
  },
  esbiko: {
    label: "Esbiko Voice",
    v: 45,
    baseFreq: 220,
    instrument: "esbiko_voice",
  },
};