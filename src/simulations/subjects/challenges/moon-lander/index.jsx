import { Box, Button, Stack, Typography } from "@mui/material";
import { Flame, Play, Target } from "lucide-react";
import MoonLanderCanvas from "./components/MoonLanderCanvas";
import MoonLanderControls from "./components/MoonLanderControls";
import MoonLanderHUD from "./components/MoonLanderHUD";
import MoonLanderSummary from "./components/MoonLanderSummary";
import useMoonLanderRuntime from "./hooks/useMoonLanderRuntime";

function TrainingBriefing({ onStart }) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 35,
        display: "grid",
        placeItems: "center",
        p: 2,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 50% 58%, rgba(14, 165, 233, 0.08), rgba(0,0,0,0.34))",
      }}
    >
      <Box
        sx={{
          width: "min(92vw, 520px)",
          p: { xs: 2.2, sm: 3 },
          borderRadius: 5,
          color: "white",
          backgroundColor: "rgba(4, 10, 22, 0.78)",
          border: "1px solid rgba(125, 249, 255, 0.22)",
          boxShadow:
            "0 0 54px rgba(56, 189, 248, 0.14), 0 30px 90px rgba(0,0,0,0.5)",
          backdropFilter: "blur(22px)",
          pointerEvents: "auto",
        }}
      >
        <Stack spacing={2.4}>
          <Box>
            <Typography
              component="div"
              sx={{
                color: "#7dd3fc",
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: 0,
                textTransform: "uppercase",
              }}
            >
              Lunar Training Academy
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 950,
                letterSpacing: 0,
                lineHeight: 1.05,
              }}
            >
              Mission 01: Training Pad
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: "rgba(232, 242, 255, 0.75)",
                fontWeight: 650,
              }}
            >
              Land inside the glowing pad. Keep descent speed low, cancel
              sideways drift, and touch down level.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1,
            }}
          >
            {[
              {
                icon: Flame,
                title: "Brake",
                text: "Hold thrust to slow your descent.",
              },
              {
                icon: Target,
                title: "Align",
                text: "Rotate before thrusting to cancel drift.",
              },
              {
                icon: Play,
                title: "Touch down",
                text: "Land softly and stay under 8 deg tilt.",
              },
            ].map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 1.35,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.065)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <item.icon size={20} color="#7dd3fc" aria-hidden="true" />
                <Typography
                  component="div"
                  sx={{ mt: 0.8, fontWeight: 950, lineHeight: 1.1 }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    color: "rgba(232, 242, 255, 0.64)",
                    fontSize: 13,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            startIcon={<Play size={18} />}
            onClick={onStart}
            variant="contained"
            sx={{
              minHeight: 50,
              borderRadius: 999,
              color: "#06111f",
              fontWeight: 950,
              background:
                "linear-gradient(135deg, rgba(125, 249, 255, 1), rgba(94, 234, 212, 0.96))",
              boxShadow: "0 18px 46px rgba(94, 234, 212, 0.24)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(186, 255, 255, 1), rgba(125, 249, 220, 1))",
              },
            }}
          >
            Start training run
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function MoonLanderChallenge() {
  const runtime = useMoonLanderRuntime();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "#071126",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {runtime.state && (
        <>
          <MoonLanderCanvas state={runtime.state} input={runtime.input} />
          <MoonLanderHUD state={runtime.state} />
          {!runtime.isReady && (
            <MoonLanderControls
              input={runtime.input}
              isPaused={runtime.isPaused}
              isFinished={runtime.isFinished}
              onControlActive={runtime.setControlActive}
              onReset={runtime.reset}
              onTogglePause={runtime.togglePause}
            />
          )}
          <MoonLanderSummary
            result={runtime.state.result}
            onReset={runtime.reset}
          />
          {runtime.isReady && <TrainingBriefing onStart={runtime.start} />}
        </>
      )}

      <Box
        sx={{
          position: "fixed",
          left: {
            xs: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 78px)",
            md: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 86px)",
          },
          top: {
            xs: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 18px)",
            md: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 20px)",
          },
          zIndex: 18,
          maxWidth: "min(52vw, 360px)",
          px: 1.5,
          py: 0.9,
          borderRadius: 999,
          color: "rgba(235, 248, 255, 0.86)",
          backgroundColor: "rgba(5, 12, 28, 0.5)",
          border: "1px solid rgba(255,255,255,0.11)",
          backdropFilter: "blur(14px)",
          pointerEvents: "none",
        }}
      >
        <Typography
          component="div"
          sx={{
            overflow: "hidden",
            fontSize: { xs: 10, sm: 12 },
            fontWeight: 950,
            letterSpacing: 0,
            textOverflow: "ellipsis",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Mission 01 - Training Pad
        </Typography>
        <Typography
          component="div"
          sx={{
            display: { xs: "none", md: "block" },
            color: "rgba(219, 238, 255, 0.58)",
            fontSize: 11,
            fontWeight: 750,
          }}
        >
          W or Up: thrust - A/D: rotate - Space: pause
        </Typography>
      </Box>
    </Box>
  );
}
