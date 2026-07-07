import { Box, Typography } from "@mui/material";
import MoonLanderCanvas from "./components/MoonLanderCanvas";
import MoonLanderControls from "./components/MoonLanderControls";
import MoonLanderHUD from "./components/MoonLanderHUD";
import MoonLanderSummary from "./components/MoonLanderSummary";
import useMoonLanderRuntime from "./hooks/useMoonLanderRuntime";

export default function MoonLanderChallenge() {
  const runtime = useMoonLanderRuntime();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "#030716",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {runtime.state && (
        <>
          <MoonLanderCanvas state={runtime.state} input={runtime.input} />
          <MoonLanderHUD state={runtime.state} />
          <MoonLanderControls
            input={runtime.input}
            isPaused={runtime.isPaused}
            isFinished={runtime.isFinished}
            onControlActive={runtime.setControlActive}
            onReset={runtime.reset}
            onTogglePause={runtime.togglePause}
          />
          <MoonLanderSummary
            result={runtime.state.result}
            onReset={runtime.reset}
          />
        </>
      )}

      <Box
        sx={{
          position: "fixed",
          left: {
            xs: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 14px)",
            md: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 20px)",
          },
          top: {
            xs: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 12px)",
            md: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 20px)",
          },
          zIndex: 18,
          px: 1.5,
          py: 0.85,
          borderRadius: 999,
          color: "rgba(235, 248, 255, 0.84)",
          backgroundColor: "rgba(5, 12, 28, 0.56)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          pointerEvents: "none",
        }}
      >
        <Typography
          component="div"
          sx={{
            fontSize: { xs: 11, sm: 12 },
            fontWeight: 900,
            letterSpacing: 0,
            textTransform: "uppercase",
          }}
        >
          Moon Lander Training Mission
        </Typography>
        <Typography
          component="div"
          sx={{
            display: { xs: "none", sm: "block" },
            color: "rgba(219, 238, 255, 0.62)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Keyboard: W/↑ thrust, A/D rotate, Space pause, R reset
        </Typography>
      </Box>
    </Box>
  );
}
