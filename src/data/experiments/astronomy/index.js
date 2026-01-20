// src/data/experiments/astronomy/index.js
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PublicIcon from "@mui/icons-material/Public";

export const astronomyExperiments = [
  {
    id: "astronomy.space.satellites-telescopes",
    domain: "astronomy",
    topic: "space",
    name: "Satellites & Tracking",
    desc: "Control ground telescopes to track satellites in orbit.",
    Icon: RocketLaunchIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #a78bfa)",
    demo: true,
    engine: "3d",
  },
  {
    id: "astronomy.kepler-lab",
    domain: "astronomy",
    topic: "space",
    name: "Kepler's Laws Lab",
    desc: "Explore planetary motion and Kepler's three laws in a dynamic simulation.",
    Icon: RocketLaunchIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #a78bfa)",
    demo: true,
  },
  {
    id: "astronomy.space.earth-orbit-lab",
    domain: "astronomy",
    topic: "space",
    name: "Earth Orbit Lab (3D)",
    desc: "Simulate orbital mechanics, Line-of-Sight, and Earth rotation.",
    Icon: PublicIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
    engine: "3d",
  },
  {
    id: "astronomy.space.solar-system",
    domain: "astronomy",
    topic: "space",
    name: "Solar System (3D)",
    desc: "Journey through space. Interactive gravity simulation of our planets.",
    Icon: PublicIcon,
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    demo: true,
    engine: "3d",
  },
];
