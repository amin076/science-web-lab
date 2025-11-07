// ✅ src/components/layout/CardWrapper.jsx
import { Paper } from "@mui/material";
import { motion } from "framer-motion";
import { colors, shadows, radius, transitions } from "@/styleSystem";

export default function CardWrapper({ children, sx = {} }) {
  return (
    <Paper
      component={motion.div}
      whileHover={{
        scale: 1.03,
        y: -4,
        boxShadow: shadows.glowBlue,
      }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      sx={{
        flex: "1 1 300px",
        minWidth: 280,
        maxWidth: 340,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: radius.md, // ✅ same as section
        background:
          "linear-gradient(145deg, rgba(30,41,59,0.92), rgba(51,65,85,0.9))", // ✅ slightly brighter but same tone
        backdropFilter: "blur(12px)",
        boxShadow: shadows.soft,
        color: colors.textPrimary,
        transition: transitions.normal,
        "&:hover": {
          boxShadow: shadows.glowBlue,
        },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
