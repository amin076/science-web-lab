// ✅ src/data/experiments.js
import ScienceIcon from "@mui/icons-material/Science";
import FunctionsIcon from "@mui/icons-material/Functions";
import BiotechIcon from "@mui/icons-material/Biotech";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WavesIcon from "@mui/icons-material/Waves"; // اضافه کن بالا

// 📘 All Experiments Library
export const experimentsData = [
  // 🔬 PHYSICS
  {
    id: "mechanics",
    subject: "Physics",
    name: "Mechanics Simulation",
    desc: "Explore motion, forces, and momentum with interactive simulations.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
    demo: true,
  },
  {
    id: "electricity",
    subject: "Physics",
    name: "Electric Circuits",
    desc: "Build and analyze simple circuits with voltage and resistance.",
    Icon: LocalFireDepartmentIcon,
    gradient: "linear-gradient(135deg,#a78bfa,#60a5fa)",
    demo: true,
  },
  {
    id: "coulomb-law-2d",
    subject: "Physics",
    name: "Coulomb's Law (2D)",
    desc: "Visualize electrostatic forces, vector field, and flux lines in 2D.",
    Icon: LocalFireDepartmentIcon,
    gradient: "linear-gradient(135deg,#f59e0b,#fb7185)",
    demo: true,
  },
  {
    id: "coulomb-law-3d",
    subject: "Physics",
    name: "Coulomb's Law (3D)",
    desc: "Explore electric field vectors and flux lines around charges in 3D.",
    Icon: LocalFireDepartmentIcon,
    gradient: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
    demo: true,
  },

  // ➗ MATHEMATICS
  {
    id: "geometry",
    subject: "Mathematics",
    name: "Geometric Shapes Explorer",
    desc: "Visualize 2D and 3D shapes and their properties.",
    Icon: FunctionsIcon,
    gradient: "linear-gradient(135deg,#34d399,#22c55e)",
    demo: true,
  },
  {
    id: "probability",
    subject: "Mathematics",
    name: "Probability Simulator",
    desc: "Run experiments to understand randomness and statistics.",
    Icon: FunctionsIcon,
    gradient: "linear-gradient(135deg,#16a34a,#22c55e)",
    demo: false,
  },

  // ⚗️ CHEMISTRY
  {
    id: "acid-base",
    subject: "Chemistry",
    name: "Acid-Base Reactions",
    desc: "Simulate neutralization and observe pH changes in real-time.",
    Icon: LocalFireDepartmentIcon,
    gradient: "linear-gradient(135deg,#ef4444,#f97316)",
    demo: true,
  },
  // 🧲 ASTRONOMY
  {
    id: "astronomy.space.satellites-telescopes",
    subject: "Astronomy",
    name: "Satellites & Telescopes (Earth)",
    desc: "Simulate Earth orbits + ground telescope visibility and tracking.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#0ea5e9,#a78bfa)",
    demo: true,
  },
{
  id: "astronomy.space.earth-orbit-lab",
  subject: "Astronomy",
  name: "Earth Orbit Lab (3D)",
  desc: "Real orbital motion + ground telescope visibility (LOS) with Earth rotation.",
  Icon: ScienceIcon,
  gradient: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
  demo: true,
},

  // 🌊 PHYSICS - WAVES`
  {
    id: "physics.waves.surface-waves-double-slit",
    subject: "Physics",
    name: "Surface Waves + Double-Slit",
    desc: "Ripple tank + interference patterns (Young’s double-slit).",
    Icon: WavesIcon,
    gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    demo: true,
  },

  // 🧪 NEW SIMULATION (DEV)
  {
    id: "newSimulation",
    subject: "Physics",
    name: "New Physics Simulation",
    desc: "A new interactive physics simulation under active development.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    demo: true,
  },
  {
    id: "earth-science.geology.plate-tectonics",
    subject: "Earth Science",
    name: "Plate Tectonics (3D)",
    desc: "Explore tectonic plate movements and Earth’s internal layers in an interactive 3D simulation.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#0f766e,#0ea5e9)",
    demo: true,
  },
  {
    id: "astronomy.space.solar-system",
    subject: "Astronomy",
    name: "Solar System (3D)",
    desc: "An interactive simulation.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    demo: true,
  },
  {
    id: "physics.mechanics.spring-mass",
    subject: "Physics",
    name: "SpringMass Oscillator",
    desc: "Explore simple harmonic motion using a springmass system.",
    Icon: ScienceIcon,
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    demo: true,
  },
];
