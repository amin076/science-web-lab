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
    baseFreq: 250,
    instrument: "saw",
  },
  highway: {
    label: "Highway",
    v: 35,
    baseFreq: 400,
    instrument: "saw",
  },
  race: {
    label: "Race Car",
    v: 80,
    baseFreq: 700,
    instrument: "saw",
  },
};