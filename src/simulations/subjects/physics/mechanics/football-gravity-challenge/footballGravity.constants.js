export const FOOTBALL_WORLDS = [
  {
    id: "moon",
    name: "Moon",
    shortName: "MOON",
    emoji: "🌙",
    gravity: 1.62,
    color: "#f8fafc",
    glow: "rgba(255,255,255,0.55)",
  },
  {
    id: "mars",
    name: "Mars",
    shortName: "MARS",
    emoji: "🔴",
    gravity: 3.71,
    color: "#ff5b52",
    glow: "rgba(255,91,82,0.48)",
  },
  {
    id: "earth",
    name: "Earth",
    shortName: "EARTH",
    emoji: "🌍",
    gravity: 9.81,
    color: "#59d66c",
    glow: "rgba(89,214,108,0.45)",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    shortName: "JUPITER",
    emoji: "🟠",
    gravity: 24.79,
    color: "#ffad45",
    glow: "rgba(255,173,69,0.42)",
  },
];

export const SHOT_CONFIG = {
  initialSpeedKmh: 130,
  launchAngleDeg: 35,
  duration: 36,
  targetFps: 60,

  ballRadius: 31,
  focusBallRadius: 38,
  trailWidth: 1.45,
  trailGlowWidth: 3.2,
};

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 60,
  mimeTypes: [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ],
  fileName: "esbiko-football-gravity-challenge.webm",
};

export const SCENES = {
  INTRO: "intro",
  LAUNCH: "launch",
  FOLLOW_MOON: "followMoon",
  WIDE_REVEAL: "wideReveal",
  RESULTS: "results",
};
