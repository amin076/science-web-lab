// ✅ src/data/experiments.js
import ScienceIcon from "@mui/icons-material/Science";
import FunctionsIcon from "@mui/icons-material/Functions";
import BiotechIcon from "@mui/icons-material/Biotech";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

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
  {
    id: "molecules",
    subject: "Chemistry",
    name: "Molecular Bonding",
    desc: "Explore how molecules bond and form compounds.",
    Icon: BiotechIcon,
    gradient: "linear-gradient(135deg,#f43f5e,#e11d48)",
    demo: false,
  },

  // 🧬 BIOLOGY
  {
    id: "cell-structure",
    subject: "Biology",
    name: "Cell Structure Explorer",
    desc: "Zoom into a cell and explore its organelles interactively.",
    Icon: BiotechIcon,
    gradient: "linear-gradient(135deg,#22c55e,#10b981)",
    demo: true,
  },
  {
    id: "dna-replication",
    subject: "Biology",
    name: "DNA Replication Process",
    desc: "Understand DNA duplication through step-by-step simulation.",
    Icon: BiotechIcon,
    gradient: "linear-gradient(135deg,#0ea5e9,#60a5fa)",
    demo: false,
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
];
