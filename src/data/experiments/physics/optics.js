// src/data/experiments/physics/optics.js
import VisibilityIcon from "@mui/icons-material/Visibility";

export const physicsOptics = [
  {
    id: "physics.optics.lens-mirror-2d",
    domain: "physics",
    topic: "optics",
    name: "Optics Bench (2D)",
    desc: "Manipulate light rays. Place convex/concave lenses and mirrors.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #22c55e, #06b6d4)",
    demo: true,
  },
  {
    id: "physics.optics.lens-mirror-3d",
    domain: "physics",
    topic: "optics",
    name: "Optics Bench (3D)",
    desc: "Step into a 3D optical lab to render real-time reflections.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #a78bfa, #60a5fa)",
    demo: true,
    engine: "3d",
  },
  {
    id: "physics.optics.microscope",
    domain: "physics",
    topic: "optics",
    name: "Virtual Microscope",
    desc: "Explore microscopic worlds. Adjust focus, magnification, and illumination.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },
];
