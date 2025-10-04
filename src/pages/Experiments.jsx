// src/pages/Experiments.jsx
import { Grid, Typography, Box } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import WavesIcon from "@mui/icons-material/Waves";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExperimentCard from "@/components/experiments/ExperimentCard";

const experiments = [
  { id: "mechanics", name: "Mechanics", desc: "Motion, forces, energy & momentum.", Icon: ScienceIcon, gradient: "linear-gradient(135deg,#0ea5e9,#22d3ee)" },
  { id: "electricity", name: "Electricity", desc: "Circuits, voltage, current & resistance.", Icon: ElectricBoltIcon, gradient: "linear-gradient(135deg,#a78bfa,#60a5fa)" },
  { id: "waves", name: "Waves", desc: "Frequency, wavelength & interference.", Icon: WavesIcon, gradient: "linear-gradient(135deg,#34d399,#22c55e)" },
  { id: "optics", name: "Optics", desc: "Reflection, refraction & lenses.", Icon: LightModeIcon, gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
];

export default function Experiments() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Physics Experiments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Pick a domain to start exploring interactive labs.
      </Typography>

      <Grid container spacing={3}>
        {experiments.map((exp) => (
          <Grid item xs={12} sm={6} md={3} key={exp.id}>
            <ExperimentCard {...exp} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
