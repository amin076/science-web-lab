// ✅ src/components/layout/Layout.jsx
import { Box, Container } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { useThemeMode } from "@/context/ThemeModeContext";
import { motion } from "framer-motion";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer"; // 🧩 اضافه شد

function Layout({ children }) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Box
      className="app-shell"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: (theme) => theme.palette.background.default,

        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* 🌈 Glow Pulse Gradient Background */}
      <Box
        component={motion.div}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: isDark
            ? "linear-gradient(120deg, #0f172a, #1e3a8a, #3b82f6, #60a5fa)"
            : "linear-gradient(120deg, #e0f2fe, #bae6fd, #60a5fa, #38bdf8)",
          backgroundSize: "400% 400%",
          filter: "blur(60px)",
          opacity: 0.3,
          transition: "opacity 1s ease-in-out",
        }}
      />

      {/* 🧭 Header */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Header />
        <Box sx={{ position: "absolute", top: 16, right: 24, zIndex: 2 }}>
          <ThemeSwitcher />
        </Box>
      </Box>

      {/* 🧱 Dashboard Drawer (شناور کنار صفحه) */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <DashboardDrawer />
      </Box>

      {/* 📄 محتوای اصلی */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          position: "relative",
          zIndex: 1,
          overflow: "visible", // ❗ مهم
        }}
      >
        {children}
      </Box>

      {/* 📍 Footer */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </Box>
    </Box>
  );
}

export default Layout;
