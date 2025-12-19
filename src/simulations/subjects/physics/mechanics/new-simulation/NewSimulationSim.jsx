import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function NewSimulationSim() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = Math.floor(parent.clientWidth);
      canvas.height = 420;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // background
      ctx.fillRect(0, 0, w, h);

      // simple demo: moving dot
      const x = w / 2 + Math.cos(tRef.current) * (w * 0.25);
      const y = h / 2 + Math.sin(tRef.current) * (h * 0.25);

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // HUD text
      ctx.font = "14px Arial";
      ctx.fillText(`t = ${tRef.current.toFixed(2)}`, 12, 24);

      if (isPlaying) {
        tRef.current += 0.03;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
        <Button variant="contained" onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            tRef.current = 0;
          }}
        >
          Reset
        </Button>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Skeleton: Canvas + basic animation loop
        </Typography>
      </Stack>

      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
    </Box>
  );
}
