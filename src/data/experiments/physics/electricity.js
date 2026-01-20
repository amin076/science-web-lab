// src/data/experiments/physics/electricity.js
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";

export const physicsElectricity = [
  {
    id: "physics.electricity.circuits",
    domain: "physics",
    topic: "electricity",
    name: "Electric Circuits Lab",
    desc: "Design your own electronics. Wire up resistors, capacitors, and batteries.",
    Icon: ElectricBoltIcon,
    gradient: "linear-gradient(135deg, #f472b6, #fb7185)",
    demo: true,
  },
  {
    id: "physics.electricity.coulomb-law-2d",
    domain: "physics",
    topic: "electricity",
    name: "Coulomb's Law (2D)",
    desc: "Visualize invisible forces. See electric fields and flux lines.",
    Icon: BlurOnIcon,
    gradient: "linear-gradient(135deg, #f59e0b, #fb7185)",
    demo: true,
  },
  {
    id: "physics.electricity.coulomb-law-3d",
    domain: "physics",
    topic: "electricity",
    name: "Coulomb's Law (3D)",
    desc: "A fully immersive 3D visualization of electric field vectors.",
    Icon: BatteryChargingFullIcon,
    gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
    demo: true,
    engine: "3d",
  },
];
