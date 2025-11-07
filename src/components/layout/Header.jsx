// ✅ src/components/layout/Header.jsx
import { Box } from "@mui/material";
import Brand from "@/components/layout/Brand";
import Navbar from "@/components/layout/Navbar";
import HamburgerMenu from "@/components/layout/HamburgerMenu";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

export default function Header() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        width: "100%",
        overflow: "hidden",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: isDark
          ? "0 2px 18px rgba(59,130,246,0.25)"
          : "0 2px 15px rgba(56,189,248,0.25)",
      }}
    >
      {/* 🌈 Animated background strip (همون افکت قبلی، فقط تنظیم‌شده‌تر) */}
      <Box
        component={motion.div}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: isDark
            ? "linear-gradient(120deg, #1e3a8a, #4338ca, #3b82f6, #60a5fa, #4f46e5)"
            : "linear-gradient(120deg, #e0f2fe, #bae6fd, #60a5fa, #38bdf8, #2563eb)",
          backgroundSize: "400% 400%",
          opacity: isDark ? 0.85 : 0.9,
          filter: "brightness(1.05) contrast(1.1)",
        }}
      />

      {/* 🌟 Header content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          mx: "auto",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // مهم: کمی فضای سمت راست، تا ThemeSwitcher (که در Layout absolute است) روی دکمه‌ها نیفته
          pr: { xs: 8, md: 3 },
          color: isDark ? "#f8fafc" : "#0f172a",
          textShadow: isDark
            ? "0 1px 2px rgba(0,0,0,0.3)"
            : "0 1px 1px rgba(255,255,255,0.4)",
        }}
      >
        <Brand />

        {/* منوی دسکتاپ */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Navbar />
        </Box>

        {/* هامبرگر مخصوص موبایل/تبلت */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <HamburgerMenu />
        </Box>
      </Box>
    </Box>
  );
}
