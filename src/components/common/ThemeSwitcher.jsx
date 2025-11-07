// ✅ src/components/common/ThemeSwitcher.jsx
import { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import { motion } from "framer-motion";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { glowEffects, colors } from "@/StyleSystem";

export default function ThemeSwitcher({ onToggle }) {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");

  const handleToggle = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
    onToggle(newMode);
  };

  useEffect(() => {
    document.body.style.transition = "background-color 0.6s ease";
  }, []);

  return (
    <motion.div {...glowEffects.hoverGlow}>
      <IconButton
        onClick={handleToggle}
        sx={{
          color: colors.accent,
          boxShadow:
            mode === "light"
              ? "0 0 10px rgba(37,99,235,0.5)"
              : "0 0 15px rgba(255,255,255,0.4)",
          transition: "all 0.4s ease",
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </motion.div>
  );
}
