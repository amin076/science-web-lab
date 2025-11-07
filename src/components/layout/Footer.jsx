// ✅ src/components/layout/Footer.jsx
import { Box, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        mt: 8,
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        boxShadow: isDark
          ? "0 -2px 18px rgba(59,130,246,0.25)"
          : "0 -2px 15px rgba(56,189,248,0.25)",
      }}
    >
      {/* 🌈 Animated Gradient Background */}
      <Box
        component={motion.div}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
        sx={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "linear-gradient(120deg, #1e3a8a, #3b82f6, #6366f1, #4f46e5)"
            : "linear-gradient(120deg, #bae6fd, #60a5fa, #38bdf8, #2563eb)",
          backgroundSize: "400% 400%",
          opacity: isDark ? 0.85 : 0.9,
          filter: "brightness(1.05) contrast(1.1)",
          zIndex: 0,
        }}
      />

      {/* 🌟 Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          py: 4,
          px: 2,
          color: isDark ? "#f1f5f9" : "#0f172a",
        }}
      >
        <Divider
          sx={{
            mb: 3,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.1)",
          }}
        />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.3px",
            mb: 1,
          }}
        >
          © {new Date().getFullYear()} Science Web Lab — All Rights Reserved.
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          Crafted with 💙 Science, Code, and Curiosity by Amin.
        </Typography>
      </Box>
    </Box>
  );
}
