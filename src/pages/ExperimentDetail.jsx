// src/pages/ExperimentDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import { experimentsData } from "@/data/experiments";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { motion } from "framer-motion";

export default function ExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const experiment = experimentsData.find((exp) => exp.id === id);

  if (!experiment) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          ❌ Experiment not found
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => navigate("/experiments")}
        >
          Back to Experiments
        </Button>
      </Box>
    );
  }

  const { name, desc, Icon, gradient, subject } = experiment;

  return (
    <Box
      sx={{
        width: "100vw",
        maxWidth: "100vw",
        mx: "calc(50% - 50vw)",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/experiments")}
          sx={{ mb: 2 }}
        >
          Back to Experiments
        </Button>

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          elevation={6}
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            background: gradient,
            color: "#fff",
            p: 4,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Icon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight={700}>
            {name}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
            {subject}
          </Typography>
        </Paper>

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            About this Experiment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {desc}
          </Typography>

          {/* ✅ Fullscreen run route */}
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate(`/experiments/${id}/run`)}
          >
            Launch Simulation
          </Button>
        </Paper>

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
            backgroundColor: "#f9fafb",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <PlayCircleFilledWhiteIcon
            sx={{ fontSize: 80, color: "#3b82f6", mb: 2 }}
          />
          <Typography variant="h6" fontWeight={600}>
            Fullscreen simulation opens in a new route.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click "Launch Simulation" to run {name} in fullscreen mode.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
