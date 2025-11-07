// ✅ src/pages/StyleGuide.jsx
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { colors, typography, shadows, spacing, radius } from "@/StyleSystem";

export default function StyleGuide() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ p: 4 }}>
      {/* 🧠 Title */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: colors.gradientCyan,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 3,
        }}
      >
        🎨 Science Web Lab — Style Guide
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* 🎨 Colors */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Color Palette
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {Object.entries(colors).map(([name, value]) => (
          <Grid item xs={6} sm={4} md={3} key={name}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.07,
                transition: { duration: 0.3 },
              }}
              sx={{
                height: 100,
                borderRadius: radius.md,
                background:
                  value.includes("gradient") || value.includes("linear")
                    ? value
                    : value,
                boxShadow: shadows.soft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              {name}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* ✍️ Typography */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Typography
      </Typography>
      <Box sx={{ mb: 5 }}>
        {Object.entries(typography.sizes).map(([key, size]) => (
          <Typography
            key={key}
            sx={{
              fontFamily: typography.fontPrimary,
              fontSize: size,
              mb: 1,
              color: isDark ? colors.textSecondary : "#334155",
            }}
          >
            {key.toUpperCase()} — The quick brown fox jumps over the lazy dog.
          </Typography>
        ))}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* 🔘 Buttons */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Buttons
      </Typography>
      <Box sx={{ display: "flex", gap: spacing.md, mb: 5, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" color="secondary">
          Accent
        </Button>
        <Button variant="outlined" color="error">
          Danger
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* 🧩 Cards & Shadows */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Cards & Shadows
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(shadows).map(([key, shadow]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              viewport={{ once: true }}
              sx={{
                p: 3,
                borderRadius: radius.md,
                boxShadow: shadow,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                color: colors.textPrimary,
                backgroundColor: isDark
                  ? theme.palette.background.paper
                  : colors.backgroundLight,
              }}
            >
              {key}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
