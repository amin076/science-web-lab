import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const experimentDetails = {
  mechanics: {
    title: "Mechanics",
    description: "Explore motion, forces, energy, and momentum with interactive labs.",
    resources: ["Newton's Laws", "Kinematics", "Dynamics"],
  },
  electricity: {
    title: "Electricity",
    description: "Learn about circuits, voltage, current, and resistance.",
    resources: ["Ohm's Law", "Circuit Diagrams", "Electromagnetism"],
  },
  waves: {
    title: "Waves",
    description: "Study frequency, wavelength, interference, and resonance.",
    resources: ["Sound Waves", "Light Waves", "Wave Interference"],
  },
  optics: {
    title: "Optics",
    description: "Discover reflection, refraction, lenses, and optical instruments.",
    resources: ["Snell's Law", "Lenses", "Optical Devices"],
  },
};

export default function ExperimentDetail() {
  const { id } = useParams();
  const experiment = experimentDetails[id];

  if (!experiment) {
    return <Typography variant="h6">Experiment not found</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{experiment.title}</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>{experiment.description}</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Resources:</Typography>
      <ul>
        {experiment.resources.map((res, idx) => (
          <li key={idx}>{res}</li>
        ))}
      </ul>

      <Button variant="contained" sx={{ mt: 2 }}>Start Experiment</Button>
    </Box>
  );
}
