// src/pages/ExperimentDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import { experimentsData } from "@/data/experiments";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
        width: "100%",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/experiments")}
        sx={{ mb: 2 }}
      >
        Back to Experiments
      </Button>

      {/* Header */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        elevation={8}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: gradient,
          color: "#fff",
          p: { xs: 3, md: 4 },
          mb: 3,
          position: "relative",
        }}
      >
        <Box sx={{ opacity: 0.15, position: "absolute", inset: 0 }}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.65), transparent 55%)",
            }}
          />
        </Box>

        <Box sx={{ position: "relative" }}>
          <Icon sx={{ fontSize: 64, mb: 1 }} />
          <Typography variant="h4" fontWeight={800}>
            {name}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5, opacity: 0.9 }}>
            {subject}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 2, justifyContent: { xs: "center", md: "flex-start" } }}
          >
            <Chip
              icon={<InfoOutlinedIcon />}
              label="Details"
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />
            <Chip
              label="Demo"
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />
          </Stack>
        </Box>
      </Paper>

      {/* Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.5fr 0.9fr" },
          gap: 3,
        }}
      >
        {/* About */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={700}>
            About this Experiment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {desc}
          </Typography>
        </Paper>

        {/* Actions */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45 }}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Run the simulation in fullscreen mode.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayCircleFilledWhiteIcon />}
            onClick={() => navigate(`/experiments/${id}/run`)}
            sx={{ py: 1.2, borderRadius: 3, fontWeight: 800 }}
          >
            Start Simulation
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/experiments")}
            sx={{ mt: 1.5, py: 1.1, borderRadius: 3, fontWeight: 700 }}
          >
            Back to Experiments
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
