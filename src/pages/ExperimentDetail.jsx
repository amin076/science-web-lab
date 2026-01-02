import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import { experimentsData } from "@/data/experiments";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { motion } from "framer-motion";

export default function ExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const experiment = experimentsData.find((exp) => exp.id === id);

  if (!experiment) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 2,
            background: "linear-gradient(to right, #ef4444, #f87171)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Experiment Not Found
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/experiments")}>
          Return to Lab
        </Button>
      </Box>
    );
  }

  const { name, desc, Icon, gradient, subject } = experiment;

  // 🛠️ HELPER: Smartly render Image URL or MUI Component
  const renderIcon = (size = 60, isBackground = false) => {
    // 1. If Icon is a URL String (3D Image)
    if (
      typeof Icon === "string" &&
      (Icon.includes("http") || Icon.includes(".png"))
    ) {
      return (
        <Box
          component="img"
          src={Icon}
          alt={name}
          sx={{
            width: size,
            height: size,
            objectFit: "contain",
            // If it's the giant background one, we don't need drop shadow
            filter: isBackground
              ? "none"
              : "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
          }}
        />
      );
    }

    // 2. If Icon is a React Component (Legacy MUI Icon)
    const ValidIcon =
      typeof Icon === "object" || typeof Icon === "function"
        ? Icon
        : ScienceOutlinedIcon;
    return <ValidIcon sx={{ fontSize: size, color: "white" }} />;
  };

  // 💎 Reusable Glass Style
  const glassPanelStyle = {
    background: "rgba(30, 41, 59, 0.4)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    borderRadius: "24px",
    overflow: "hidden",
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 8, pt: 4, position: "relative" }}>
      {/* 🌑 Background Ambiance */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            background: gradient,
            filter: "blur(120px)",
            opacity: 0.15,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background: "#4f46e5",
            filter: "blur(120px)",
            opacity: 0.1,
          }}
        />
      </Box>

      <Container maxWidth="lg">
        {/* 🔙 Navigation Bar */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/experiments")}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                color: "white",
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Back to Experiments
          </Button>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Save for later">
              <IconButton
                sx={{ color: "text.secondary", "&:hover": { color: "white" } }}
              >
                <BookmarkBorderOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton
                sx={{ color: "text.secondary", "&:hover": { color: "white" } }}
              >
                <ShareOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 🦸 HERO SECTION */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            ...glassPanelStyle,
            p: { xs: 3, md: 6 },
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 4,
            position: "relative",
          }}
        >
          {/* Decorative Giant Icon Background */}
          <Box
            sx={{
              position: "absolute",
              right: -20,
              bottom: -40,
              opacity: 0.05,
              transform: "rotate(-15deg)",
              pointerEvents: "none", // Prevent blocking clicks
            }}
          >
            {/* ✅ Use Helper with Large Size */}
            {renderIcon(400, true)}
          </Box>

          {/* Left: Icon & Gradient Ring */}
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: `0 0 40px ${gradient.split(",")[1]}40`,
              }}
            >
              {/* ✅ Use Helper with Normal Size */}
              {renderIcon(70)}
            </Box>

            {/* Status Chip */}
            <Chip
              label="Interactive"
              size="small"
              sx={{
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                background: gradient,
                color: "white",
                fontWeight: 700,
                border: "2px solid #1e293b",
              }}
            />
          </Box>

          {/* Right: Text Info */}
          <Box
            sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, zIndex: 1 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              {subject.toUpperCase()} LAB
            </Typography>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 1,
                background: "linear-gradient(to bottom, #ffffff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {name}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "center", md: "flex-start" }}
              alignItems="center"
            >
              <Chip
                label="Physics Engine: v2.0"
                variant="outlined"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                size="small"
              />
              <Chip
                label="3D Render"
                variant="outlined"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                size="small"
              />
            </Stack>
          </Box>
        </Box>

        {/* 📄 CONTENT GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Main Description */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{
              ...glassPanelStyle,
              p: 4,
            }}
          >
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <ScienceOutlinedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" fontWeight={700}>
                About this Experiment
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.8,
                fontSize: "1.05rem",
              }}
            >
              {desc}
            </Typography>

            <Box
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                background: "rgba(0,0,0,0.2)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
              >
                🎓 Learning Objectives:
              </Typography>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <li>Understand the fundamental principles of {subject}.</li>
                <li>Observe real-time data visualization.</li>
                <li>
                  Manipulate variables to see cause-and-effect relationships.
                </li>
              </ul>
            </Box>
          </Box>

          {/* Sidebar / Actions */}
          <Stack spacing={3}>
            {/* Action Card */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              sx={{
                ...glassPanelStyle,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Ready to explore?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}
              >
                Launch the simulation environment to start experimenting.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => navigate(`/experiments/${id}/run`)}
                sx={{
                  background: gradient,
                  color: "white",
                  fontWeight: 800,
                  py: 1.5,
                  borderRadius: "12px",
                  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.4)",
                  "&:hover": {
                    filter: "brightness(1.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 25px -5px rgba(0,0,0,0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Launch Simulation
              </Button>
            </Box>

            {/* Technical Specs (Decorative) */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              sx={{
                ...glassPanelStyle,
                p: 3,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 2, color: "white" }}
              >
                Simulation Specs
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Difficulty
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    Intermediate
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Est. Time
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    10 - 15 Mins
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Device
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    Desktop / Tablet
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
