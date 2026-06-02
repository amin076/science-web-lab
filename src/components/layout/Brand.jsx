import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function Brand() {
  return (
    <Box
      component={motion.a}
      href="/"
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
        gap: 1.2,
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
      {/* 🔵 Brand Logo Image */}
      <motion.img
        src="/favicon.svg"
        alt="Esbiko Logo"
        initial={{ rotate: 0 }}
        animate={{
          rotate: [0, 10, -10, 0],
          filter: [
            "drop-shadow(0 0 0px rgba(59,130,246,0))",
            "drop-shadow(0 0 8px rgba(59,130,246,0.7))",
            "drop-shadow(0 0 0px rgba(59,130,246,0))",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          width: 40,
          height: 40,
        }}
      />

      {/* 🔹 Brand Name */}
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
        Esbiko
      </Typography>
    </Box>
  );
}
