import { IconButton } from "@mui/material";
import { m as M } from "framer-motion";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { useThemeMode } from "@/context/ThemeModeContext";
import { glowEffects, colors } from "@/StyleSystem";

export default function ThemeSwitcher() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <M.div {...(glowEffects?.hoverGlow ?? {})}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: colors?.accent ?? "#60a5fa",
          boxShadow:
            mode === "light"
              ? "0 0 10px rgba(37,99,235,0.5)"
              : "0 0 15px rgba(255,255,255,0.35)",
          transition: "all 0.35s ease",
        }}
        aria-label="toggle theme"
        title="Toggle theme"
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </M.div>
  );
}
