// src/components/layout/Layout.jsx
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { useThemeMode } from "@/context/ThemeModeContext";
import { motion } from "framer-motion";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";

function Layout({
  children,
  layout = {
    header: true,
    footer: true,
  },
}) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const showHeader = layout?.header !== false;
  const showFooter = layout?.footer !== false;

  return (
    <Box
      className="app-shell"
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundColor: (theme) => theme.palette.background.default,
        overflowX: "hidden",
      }}
    >
      {/* Glow background */}
      <Box
        component={motion.div}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          opacity: [0.18, 0.28, 0.18],
        }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: isDark
            ? "linear-gradient(120deg, #0b1220, #123a8a, #2563eb, #60a5fa)"
            : "linear-gradient(120deg, #f1f5ff, #dbeafe, #60a5fa, #38bdf8)",
          backgroundSize: "400% 400%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Header (movable) */}
      {showHeader && (
        <Box sx={{ position: "relative", zIndex: 10 }}>
          <Header />

          {/* Theme switcher on header (always visible, but movable with header) */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 20,
              pointerEvents: "auto",
            }}
          >
            <ThemeSwitcher />
          </Box>
        </Box>
      )}

      {/* Dashboard Drawer (floating is OK) */}
      <Box sx={{ position: "fixed", right: 16, top: 120, zIndex: 50 }}>
        <DashboardDrawer />
      </Box>

      {/* Main */}
      <Box component="main" sx={{ position: "relative", zIndex: 1 }}>
        {children}
      </Box>

      {/* Footer (movable) */}
      {showFooter && (
        <Box sx={{ position: "relative", zIndex: 1, mt: 6 }}>
          <Footer />
        </Box>
      )}
    </Box>
  );
}

export default Layout;
