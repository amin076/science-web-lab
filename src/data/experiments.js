// ✅ src/data/experiments.js

import ScienceIcon from "@mui/icons-material/Science";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import SpeedIcon from "@mui/icons-material/Speed";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PublicIcon from "@mui/icons-material/Public";
import WavesIcon from "@mui/icons-material/Waves";
import BalanceIcon from "@mui/icons-material/Balance";
import TerrainIcon from "@mui/icons-material/Terrain";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import OpacityIcon from "@mui/icons-material/Opacity"; // For Ripple Tank
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull"; // For Coulomb 3D

// 📘 All Experiments Library
export const experimentsData = [
  // 🔬 PHYSICS - MECHANICS
  {
    id: "mechanics",
    subject: "Physics",
    name: "Mechanics Simulation",
    desc: "Master Newton's laws. Experiment with force, mass, and acceleration.",
    Icon: SpeedIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },
  {
    id: "physics.mechanics.collision",
    subject: "Physics",
    name: "Collision Simulator",
    desc: "Crash objects together! Visualize elastic vs. inelastic collisions.",
    Icon: CompareArrowsIcon,
    gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
    demo: true,
  },
  {
    id: "physics.mechanics.seesaw",
    subject: "Physics",
    name: "Seesaw Balance",
    desc: "Learn about torque and rotational equilibrium by balancing objects.",
    Icon: BalanceIcon,
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    demo: true,
  },
  {
    id: "physics.mechanics.spring-mass",
    subject: "Physics",
    name: "Spring-Mass Oscillator",
    desc: "Analyze Simple Harmonic Motion (SHM), period, and damping.",
    Icon: ShowChartIcon,
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    demo: true,
  },

  // ⚡ PHYSICS - ELECTRICITY & MAGNETISM
  {
    id: "physics.electricity.circuits",
    subject: "Physics",
    name: "Electric Circuits Lab",
    desc: "Design your own electronics. Wire up resistors, capacitors, and batteries.",
    Icon: ElectricBoltIcon,
    gradient: "linear-gradient(135deg, #f472b6, #fb7185)",
    demo: true,
  },
  {
    id: "coulomb-law-2d",
    subject: "Physics",
    name: "Coulomb's Law (2D)",
    desc: "Visualize invisible forces. See electric fields and flux lines.",
    Icon: BlurOnIcon,
    gradient: "linear-gradient(135deg, #f59e0b, #fb7185)",
    demo: true,
  },
  {
    id: "coulomb-law-3d",
    subject: "Physics",
    name: "Coulomb's Law (3D)",
    desc: "A fully immersive 3D visualization of electric field vectors.",
    Icon: BatteryChargingFullIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },

  // 🔭 PHYSICS - OPTICS
  {
    id: "physics.optics.lens-mirror-2d",
    subject: "Physics",
    name: "Optics Bench (2D)",
    desc: "Manipulate light rays. Place convex/concave lenses and mirrors.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #22c55e, #06b6d4)",
    demo: true,
  },
  {
    id: "physics.optics.lens-mirror-3d",
    subject: "Physics",
    name: "Optics Bench (3D)",
    desc: "Step into a 3D optical lab to render real-time reflections.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #a78bfa, #60a5fa)",
    demo: true,
  },

  // 🔊 PHYSICS - WAVES & ACOUSTICS
  {
    id: "physics.acoustics.doppler",
    subject: "Physics",
    name: "Doppler Effect",
    desc: "Hear the shift. Visualize how sound wave frequencies compress.",
    Icon: GraphicEqIcon,
    gradient: "linear-gradient(135deg, #f43f5e, #ec4899)",
    demo: true,
  },
  {
    id: "physics.waves.surface-waves-double-slit",
    subject: "Physics",
    name: "Ripple Tank",
    desc: "Create water waves and replicate Young’s famous double-slit experiment.",
    Icon: OpacityIcon,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    demo: true,
  },

  // 🚀 ASTRONOMY
  {
    id: "astronomy.space.satellites-telescopes",
    subject: "Astronomy",
    name: "Satellites & Tracking",
    desc: "Control ground telescopes to track satellites in orbit.",
    Icon: RocketLaunchIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #a78bfa)",
    demo: true,
  },
  {
    id: "astronomy.space.earth-orbit-lab",
    subject: "Astronomy",
    name: "Earth Orbit Lab (3D)",
    desc: "Simulate orbital mechanics, Line-of-Sight, and Earth rotation.",
    Icon: PublicIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },
  {
    id: "astronomy.space.solar-system",
    subject: "Astronomy",
    name: "Solar System (3D)",
    desc: "Journey through space. Interactive gravity simulation of our planets.",
    Icon: PublicIcon,
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    demo: true,
  },

  // ⚗️ CHEMISTRY
  {
    id: "acid-base",
    subject: "Chemistry",
    name: "Acid-Base Titration",
    desc: "Mix solutions safely. Simulate neutralization reactions.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg, #ef4444, #f97316)",
    demo: true,
  },

  // 🌋 EARTH SCIENCE
  {
    id: "earth-science.geology.plate-tectonics",
    subject: "Earth Science",
    name: "Plate Tectonics (3D)",
    desc: "Dive underground. Explore Earth’s crust and mantle.",
    Icon: TerrainIcon,
    gradient: "linear-gradient(135deg, #0f766e, #0ea5e9)",
    demo: true,
  },
];
