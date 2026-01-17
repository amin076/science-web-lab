// ✅ src/data/experiments.js
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import HeadphonesIcon from "@mui/icons-material/Headphones";
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
import Thermometer from "@mui/icons-material/Thermostat";
import BalanceIcon from "@mui/icons-material/Balance";
import TerrainIcon from "@mui/icons-material/Terrain";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import OpacityIcon from "@mui/icons-material/Opacity"; // For Ripple Tank
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull"; // For Coulomb 3D
import TuneIcon from "@mui/icons-material/Tune"; // Add this for the Pendulum
import { GlassWaterIcon } from "lucide-react"; // For Archimedes Principle
// 📘 All Experiments Library
export const experimentsData = [
  // 🔬 PHYSICS - MECHANICS

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
    id: "physics.mechanics.simple-pendulum",
    subject: "Physics",
    name: "Simple Pendulum",
    desc: "Explore harmonic motion. Modify length, gravity, and damping.",
    Icon: TuneIcon,
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
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
  {
    id: "physics.mechanics.projectile",
    subject: "Physics",
    name: "Projectile Motion",
    desc: " Experiment with velocity, and acceleration in a projectile motion.",
    Icon: SpeedIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
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
  // 💧 PHYSICS - FLUID MECHANICS
  {
    id: "physics.fluid-mechanics.archimedes-principle",
    subject: "Physics",
    name: "Archimedes Principle",
    desc: "Discover buoyancy. See how objects float or sink in fluids.",
    Icon: GlassWaterIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },

  // 🌡️ PHYSICS - THERMODYNAMICS
  {
    id: "physics.thermodynamics.gas",
    subject: "Physics",
    name: "Ideal Gas Law Simulation",
    desc: "Explore the relationship between pressure, volume, and temperature.",
    Icon: Thermometer,
    gradient: "linear-gradient(135deg, #f472b6, #fb7185)",
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
  {
    id: "physics.optics.microscope",
    subject: "Physics",
    name: "Virtual Microscope",
    desc: "Explore microscopic worlds. Adjust focus, magnification, and illumination.",
    Icon: VisibilityIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
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
    id: "physics.acoustics.sound-waves",
    subject: "Physics",
    name: "Sound Waves Lab",
    desc: "Visualize how frequency, amplitude, and waveform shape create the sounds we hear.",
    Icon: VolumeUpIcon,
    gradient: "linear-gradient(135deg, #f43f5e, #ec4899)",
    demo: true,
  },
  {
    id: "physics.acoustics.spatial-audio",
    subject: "Physics",
    name: "Spatial Audio Lab",
    desc: "Experience 3D sound in a virtual environment.",
    Icon: HeadphonesIcon,
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
  {
    id: "physics.waves.multi-source-interference",
    subject: "Physics",
    name: "Multi-Source Interference",
    desc: "Visualize wave interference from multiple sources.",
    Icon: WavesIcon,
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
    id: "astronomy.kepler-lab",
    subject: "Astronomy",
    name: "Kepler's Laws Lab",
    desc: "Explore planetary motion and Kepler's three laws in a dynamic simulation.",
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
  {
    id: "physics.mechanics.circular-motion",
    subject: "Physics",
    name: "Uniform Circular Motion",
    desc: "Enter radius and speed to see velocity/acceleration components over time",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },
  // PLOP:INSERT:EXPERIMENTS
  {
    id: "physics.mechanics.gyroscope",
    subject: "Physics",
    name: "gyroscope motion",
    desc: "a device that uses a spinning wheel or disc to detect and maintain orientation",
    Icon: SpeedIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },

  {
    id: "physics.mechanics.gearbox-differential-3d",
    subject: "Physics",
    name: "Gearbox & Differential (3D)",
    desc: "Explore gear ratios and differential behavior: speed changes, direction reversal, and wheel speeds while turning.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },

  {
    id: "physics.mechanics.pulley-system",
    subject: "Physics",
    name: "Block and Tackle",
    desc: "Intractive rope and pulley lifting simulation that visualizes mechanical advantage, rope tention and friction",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },

  {
    id: "physics.mechanics.two-body-gravity",
    subject: "Physics",
    name: "Two-Body Gravity",
    desc: "Set masses and initial velocities for both bodies and observe their motion",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
  },
];
