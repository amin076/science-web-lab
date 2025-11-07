// 🌈 src/theme.js
import { createTheme } from "@mui/material/styles";
import { colors, radius, shadows, transitions } from "@/styleSystem";

// 💡 تابع ساخت تم
const makeTheme = (mode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      background: {
        default: isDark ? colors.backgroundDark : colors.backgroundLight,
        paper: isDark ? "#1E293B" : "#FFFFFF",
      },
      text: {
        primary: isDark ? colors.textPrimary : "#0f172a",
        secondary: isDark ? colors.textSecondary : "#334155",
      },
    },

    typography: {
      fontFamily: "Poppins, Roboto, sans-serif",
      h1: { fontSize: "2.5rem", fontWeight: 700 },
      h2: { fontSize: "2rem", fontWeight: 600 },
      h3: { fontSize: "1.75rem", fontWeight: 600 },
      body1: { fontSize: "1rem", lineHeight: 1.6 },
      button: { textTransform: "none", fontWeight: 600 },
    },

    shape: { borderRadius: radius.md },

    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            boxShadow: isDark ? shadows.soft : shadows.medium,
            transition: transitions.normal,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? "linear-gradient(90deg,#0f172a,#1e293b)"
              : colors.gradientBlue,
            boxShadow: shadows.medium,
            transition: transitions.normal,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            textTransform: "none",
            transition: transitions.normal,
            "&:hover": {
              boxShadow: shadows.glowBlue,
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            boxShadow: shadows.soft,
            transition: transitions.normal,
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: shadows.glowBlue,
            },
          },
        },
      },
      "&:hover": {
  transform: "translateY(-3px)",
  boxShadow: shadows.glowBlue,
},

    },
  });
};

// 🌞 و 🌙 حالت‌های روشن و تاریک
export const lightTheme = makeTheme("light");
export const darkTheme = makeTheme("dark");
