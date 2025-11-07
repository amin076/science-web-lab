// ✅ src/components/layout/SectionPaper.jsx
import { Paper } from "@mui/material";
import { motion } from "framer-motion";
import { radius, shadows, transitions } from "@/StyleSystem";

export default function SectionPaper({ children, sx = {} }) {
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: radius.md, // ✅ same small consistent corner radius
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))", // ✅ darker glass look
        boxShadow: shadows.soft,
        backdropFilter: "blur(10px)",
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
