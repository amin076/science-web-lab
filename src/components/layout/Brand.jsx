import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ScienceIcon from "@mui/icons-material/Science";

export default function Brand() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        boxShadow: [
          "0 0 0px rgba(59,130,246,0)",
          "0 0 15px rgba(59,130,246,0.4)",
          "0 0 25px rgba(59,130,246,0.6)",
          "0 0 15px rgba(59,130,246,0.4)",
          "0 0 0px rgba(59,130,246,0)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: "10px",
      }}
      whileHover={{
        scale: 1.05,
        textShadow: "0 0 12px rgba(255,255,255,0.8)",
        transition: { duration: 0.4 },
      }}
    >
      <ScienceIcon
        component={motion.svg}
        animate={{
          scale: [1, 1.1, 1],
          filter: [
            "drop-shadow(0 0 0px rgba(59,130,246,0))",
            "drop-shadow(0 0 8px rgba(59,130,246,0.8))",
            "drop-shadow(0 0 0px rgba(59,130,246,0))",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          fontSize: 36,
          color: "#fff",
        }}
      />
      <Typography
        variant="h6"
        component={motion.span}
        animate={{
          textShadow: [
            "0 0 0px rgba(59,130,246,0)",
            "0 0 10px rgba(59,130,246,0.7)",
            "0 0 0px rgba(59,130,246,0)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        sx={{
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.5px",
          background: "linear-gradient(90deg, #38bdf8, #3b82f6, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Science Web Lab
      </Typography>
    </Box>
  );
}
