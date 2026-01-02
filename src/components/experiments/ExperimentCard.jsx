import { Box, Typography, Button } from "@mui/material";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScienceIcon from "@mui/icons-material/Science"; // Fallback import

export default function ExperimentCard({ id, name, desc, Icon, gradient }) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // ✅ SAFELY handle the Icon.
  // We expect a React Component (MUI Icon). If missing, use Fallback.
  const ValidIcon = Icon || ScienceIcon;

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const handleHoverStart = () => {
    setIsHovered(true);
    controls.start({
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" },
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    controls.start({
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    });
  };

  const goToRun = useCallback(() => {
    navigate(`/experiments/${id}/run`);
  }, [navigate, id]);

  const goToDetails = useCallback(() => {
    navigate(`/experiments/${id}`);
  }, [navigate, id]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        // Glassmorphism
        background: "rgba(30, 41, 59, 0.4)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: isHovered
          ? "0 20px 40px rgba(0,0,0,0.4)"
          : "0 4px 6px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      {/* 🔦 Top Ambient Glow */}
      <Box
        sx={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "150px",
          height: "150px",
          background: gradient,
          filter: "blur(60px)",
          opacity: 0.4,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* 🧪 Icon Container */}
      <Box
        sx={{
          pt: 5,
          pb: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          }}
        >
          <ValidIcon sx={{ fontSize: 40, color: "white" }} />
        </Box>
      </Box>

      {/* 📝 Content */}
      <Box
        sx={{
          p: 3,
          pt: 1,
          flexGrow: 1,
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          gutterBottom
          sx={{
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.5px",
            mb: 1.5,
          }}
        >
          {name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
            fontSize: "0.9rem",
          }}
        >
          {desc}
        </Typography>
      </Box>

      {/* 🧭 Action Buttons */}
      <Box
        sx={{
          p: 3,
          pt: 0,
          display: "flex",
          gap: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<PlayArrowRoundedIcon />}
          onClick={(e) => {
            e.stopPropagation();
            goToRun();
          }}
          sx={{
            background: gradient,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 4px 14px 0 rgba(0,0,0,0.3)",
            color: "white",
            "&:hover": {
              filter: "brightness(1.1)",
              boxShadow: "0 6px 20px 0 rgba(0,0,0,0.4)",
            },
          }}
        >
          Start
        </Button>

        <Button
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            goToDetails();
          }}
          sx={{
            minWidth: "50px",
            borderRadius: "12px",
            borderColor: "rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              borderColor: "white",
              background: "rgba(255,255,255,0.05)",
            },
          }}
        >
          <InfoOutlinedIcon />
        </Button>
      </Box>
    </Box>
  );
}
