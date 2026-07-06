// src/data/experiments/creative/index.js
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const creativeExperiments = [
  {
    id: "creative.patterns.ambient-pattern-studio",
    domain: "creative",
    topic: "patterns",
    name: "Ambient Pattern Studio",
    desc: "Design seamless abstract motion backgrounds for Shorts, YouTube videos, and relaxation loops.",
    Icon: AutoAwesomeIcon,
    gradient: "linear-gradient(135deg, #22d3ee, #a78bfa)",
    demo: true,
    tags: ["patterns", "background", "ambient", "video", "loop", "shorts"],
    capabilities: {
      physics: false,
      recording: true,
      export: true,
      presets: true,
    },
  },
];
