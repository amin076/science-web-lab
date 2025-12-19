// ✅ src/components/experiments/ExperimentCard.jsx
import { Box, Typography, Button, Divider } from "@mui/material";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function ExperimentCard({ id, name, desc, Icon, gradient }) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // ✅ نمایش اولیه کارت
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const handleHoverStart = () => {
    setIsHovered(true);
    controls.start({
      scale: 1.04,
      y: -6,
      boxShadow: "0 0 25px rgba(0,0,0,0.25)",
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    controls.start({
      scale: 1,
      y: 0,
      boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
      transition: { duration: 0.6, ease: "easeOut" },
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
      initial={{ opacity: 0, y: 10 }}
      animate={controls}
      whileTap={{ scale: 0.98 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "background.paper",
        boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
        transition: "all 0.4s ease",
      }}
    >
      {/* 🌈 Header Gradient */}
      <Box
        sx={{
          background: gradient,
          color: "white",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 120,
        }}
      >
        <Icon sx={{ fontSize: 48 }} />
      </Box>

      {/* 📘 Details */}
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{
            textAlign: "center",
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {desc}
        </Typography>
      </Box>

      <Divider />

      {/* 🧭 Action Buttons */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "6px",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // ✅ اگر بعداً کارت هم clickable شد
            goToRun();
          }}
        >
          START
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          sx={{ textTransform: "none", fontWeight: 500 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToDetails();
          }}
        >
          DETAILS
        </Button>
      </Box>
    </Box>
  );
}
