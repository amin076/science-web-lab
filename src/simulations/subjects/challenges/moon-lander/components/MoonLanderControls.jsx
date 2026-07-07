import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  Flame,
  Pause,
  Play,
  RotateCcw,
  RotateCcwSquare,
  RotateCwSquare,
} from "lucide-react";
import {
  SimulationFloatingActions,
  SimulationMobileToolbar,
} from "@/components/mobile";

function ControlButton({
  label,
  active,
  size = "standard",
  onPressStart,
  onPressEnd,
  children,
}) {
  const buttonSize =
    size === "large"
      ? { xs: 86, sm: 98 }
      : { xs: 68, sm: 76 };

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onPressStart();
  };

  const handlePointerUp = (event) => {
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    onPressEnd();
  };

  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={onPressEnd}
      onPointerLeave={onPressEnd}
      sx={{
        width: buttonSize,
        height: buttonSize,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: "white",
        border: active
          ? "1px solid rgba(125, 249, 255, 0.92)"
          : "1px solid rgba(255,255,255,0.18)",
        background: active
          ? "radial-gradient(circle at 50% 32%, rgba(255,255,255,0.95), rgba(56,189,248,0.88) 28%, rgba(79,70,229,0.88) 100%)"
          : "radial-gradient(circle at 50% 24%, rgba(255,255,255,0.12), rgba(8,18,34,0.78) 60%, rgba(4,8,18,0.92))",
        boxShadow: active
          ? "0 0 34px rgba(74, 222, 255, 0.52), 0 18px 54px rgba(0,0,0,0.42)"
          : "0 18px 48px rgba(0,0,0,0.38)",
        backdropFilter: "blur(16px)",
        cursor: "pointer",
        touchAction: "none",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        transform: active ? "scale(0.96)" : "scale(1)",
      }}
    >
      {children}
    </Box>
  );
}

export default function MoonLanderControls({
  input,
  isPaused,
  isFinished,
  onControlActive,
  onReset,
  onTogglePause,
}) {
  const pauseLabel = isPaused ? "Resume mission" : "Pause mission";

  return (
    <>
      <SimulationFloatingActions
        position="bottom-left"
        direction="row"
        spacing={{ xs: 1.1, sm: 1.4 }}
        sx={{
          bottom: {
            xs: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 86px)",
            md: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 26px)",
          },
          left: {
            xs: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 18px)",
            md: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 30px)",
          },
        }}
      >
        <Stack spacing={0.8} alignItems="center">
          <ControlButton
            label="Rotate left"
            active={input.rotateLeft}
            onPressStart={() => onControlActive("rotateLeft", true)}
            onPressEnd={() => onControlActive("rotateLeft", false)}
          >
            <RotateCcwSquare size={30} aria-hidden="true" />
          </ControlButton>
          <Typography
            sx={{
              color: "rgba(235, 248, 255, 0.74)",
              fontSize: 10,
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Left
          </Typography>
        </Stack>
        <Stack spacing={0.8} alignItems="center">
          <ControlButton
            label="Rotate right"
            active={input.rotateRight}
            onPressStart={() => onControlActive("rotateRight", true)}
            onPressEnd={() => onControlActive("rotateRight", false)}
          >
            <RotateCwSquare size={30} aria-hidden="true" />
          </ControlButton>
          <Typography
            sx={{
              color: "rgba(235, 248, 255, 0.74)",
              fontSize: 10,
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Right
          </Typography>
        </Stack>
      </SimulationFloatingActions>

      <SimulationFloatingActions
        position="bottom-right"
        sx={{
          bottom: {
            xs: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 82px)",
            md: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 26px)",
          },
          right: {
            xs: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 18px)",
            md: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 30px)",
          },
        }}
      >
        <Stack spacing={0.8} alignItems="center">
          <ControlButton
            label="Main thrust"
            active={input.mainThrust}
            size="large"
            onPressStart={() => onControlActive("mainThrust", true)}
            onPressEnd={() => onControlActive("mainThrust", false)}
          >
            <Flame size={36} aria-hidden="true" />
          </ControlButton>
          <Typography
            sx={{
              color: input.mainThrust ? "#7dd3fc" : "rgba(235, 248, 255, 0.78)",
              fontSize: 11,
              fontWeight: 950,
              textTransform: "uppercase",
            }}
          >
            Hold thrust
          </Typography>
        </Stack>
      </SimulationFloatingActions>

      <SimulationMobileToolbar
        placement="bottom"
        sx={{
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
          width: { xs: "min(320px, calc(100vw - 132px))", sm: 330 },
          justifyContent: "center",
          px: 1,
          py: 0.75,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={pauseLabel}>
            <span>
              <IconButton
                aria-label={pauseLabel}
                onClick={onTogglePause}
                disabled={isFinished}
                sx={{
                  color: "white",
                  minWidth: 42,
                  minHeight: 42,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
                }}
              >
                {isPaused ? <Play size={19} /> : <Pause size={19} />}
              </IconButton>
            </span>
          </Tooltip>
          <IconButton
            aria-label="Reset mission"
            onClick={onReset}
            sx={{
              color: "white",
              minWidth: 42,
              minHeight: 42,
              backgroundColor: "rgba(255,255,255,0.08)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
            }}
          >
            <RotateCcw size={19} />
          </IconButton>
        </Stack>
      </SimulationMobileToolbar>
    </>
  );
}
