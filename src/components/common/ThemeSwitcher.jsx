// src/components/common/ThemeSwitcher.jsx
import { useEffect, useState, useMemo } from "react";
import { IconButton } from "@mui/material";
import { m as M } from "framer-motion";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { glowEffects, colors } from "@/StyleSystem";

export default function ThemeSwitcher({ onToggle }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || "light";
  });

  const MotionDiv = useMemo(() => M.div, []);

  const handleToggle = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newMode);
    }

    onToggle?.(newMode);
  };

  useEffect(() => {
    document.body.style.transition = "background-color 0.6s ease";
  }, []);

  return (
    <MotionDiv {...(glowEffects?.hoverGlow ?? {})}>
      <IconButton
        onClick={handleToggle}
        sx={{
          color: colors?.accent ?? "#60a5fa",
          boxShadow:
            mode === "light"
              ? "0 0 10px rgba(37,99,235,0.5)"
              : "0 0 15px rgba(255,255,255,0.4)",
          transition: "all 0.4s ease",
        }}
        aria-label="toggle theme"
        title="Toggle theme"
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </MotionDiv>
  );
}
