import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import { Pause, Play, RotateCcw, RotateCcwSquare, RotateCwSquare, Rocket } from "lucide-react";
import {
  SimulationFloatingActions,
  SimulationMobileToolbar,
} from "@/components/mobile";

function ControlButton({ label, active, onPressStart, onPressEnd, children }) {
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
    <Button
      aria-label={label}
      variant="contained"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={onPressEnd}
      onPointerLeave={onPressEnd}
      sx={{
        minWidth: { xs: 72, sm: 84 },
        minHeight: { xs: 58, sm: 64 },
        borderRadius: 4,
        color: "white",
        border: "1px solid rgba(255,255,255,0.16)",
        background: active
          ? "linear-gradient(135deg, rgba(96, 230, 255, 0.95), rgba(117, 91, 255, 0.82))"
          : "rgba(8, 18, 34, 0.74)",
        boxShadow: active
          ? "0 0 28px rgba(88, 218, 255, 0.42)"
          : "0 16px 42px rgba(0,0,0,0.32)",
        backdropFilter: "blur(14px)",
        touchAction: "none",
        "&:hover": {
          background: active
            ? "linear-gradient(135deg, rgba(112, 239, 255, 1), rgba(132, 106, 255, 0.9))"
            : "rgba(15, 30, 56, 0.82)",
        },
      }}
    >
      {children}
    </Button>
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
        spacing={1}
        sx={{
          bottom: {
            xs: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 84px)",
            md: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 22px)",
          },
        }}
      >
        <ControlButton
          label="Rotate left"
          active={input.rotateLeft}
          onPressStart={() => onControlActive("rotateLeft", true)}
          onPressEnd={() => onControlActive("rotateLeft", false)}
        >
          <RotateCcwSquare size={28} aria-hidden="true" />
        </ControlButton>
        <ControlButton
          label="Rotate right"
          active={input.rotateRight}
          onPressStart={() => onControlActive("rotateRight", true)}
          onPressEnd={() => onControlActive("rotateRight", false)}
        >
          <RotateCwSquare size={28} aria-hidden="true" />
        </ControlButton>
      </SimulationFloatingActions>

      <SimulationFloatingActions
        position="bottom-right"
        sx={{
          bottom: {
            xs: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 84px)",
            md: "calc(var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)) + 22px)",
          },
        }}
      >
        <ControlButton
          label="Main thrust"
          active={input.mainThrust}
          onPressStart={() => onControlActive("mainThrust", true)}
          onPressEnd={() => onControlActive("mainThrust", false)}
        >
          <Stack alignItems="center" spacing={0.4}>
            <Rocket size={30} aria-hidden="true" />
            <span style={{ fontSize: 11, fontWeight: 900 }}>THRUST</span>
          </Stack>
        </ControlButton>
      </SimulationFloatingActions>

      <SimulationMobileToolbar
        placement="bottom"
        sx={{
          mx: "auto",
          width: { xs: "calc(100vw - 24px)", sm: "min(560px, calc(100vw - 32px))" },
          justifyContent: "center",
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
                  minWidth: 44,
                  minHeight: 44,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
                }}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </IconButton>
            </span>
          </Tooltip>
          <Button
            startIcon={<RotateCcw size={18} />}
            onClick={onReset}
            sx={{
              minHeight: 44,
              borderRadius: 999,
              px: 2,
              color: "white",
              fontWeight: 900,
              backgroundColor: "rgba(255,255,255,0.08)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
            }}
          >
            Reset
          </Button>
        </Stack>
      </SimulationMobileToolbar>
    </>
  );
}
