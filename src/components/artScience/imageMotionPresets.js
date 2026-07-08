export const IMAGE_MOTION_PRESETS = {
  cosmicZoom: {
    label: "Slow Cosmic Zoom",
    startScale: 1.05,
    endScale: 1.18,
    panX: 0.02,
    panY: -0.015,
  },
  orbitPan: {
    label: "Orbit Pan",
    startScale: 1.08,
    endScale: 1.15,
    panX: -0.035,
    panY: 0.01,
  },
  deepSpaceDrift: {
    label: "Deep Space Drift",
    startScale: 1.04,
    endScale: 1.12,
    panX: 0.015,
    panY: 0.025,
  },
  documentaryPush: {
    label: "Documentary Push",
    startScale: 1,
    endScale: 1.1,
    panX: 0,
    panY: -0.01,
  },
};

export const IMAGE_MOTION_FORMATS = {
  shorts: {
    label: "YouTube Shorts 9:16",
    width: 1080,
    height: 1920,
    recorderMode: "shorts",
  },
  landscape: {
    label: "Landscape 16:9",
    width: 1920,
    height: 1080,
    recorderMode: "landscape",
  },
};
