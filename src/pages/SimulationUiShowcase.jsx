import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  SimulationButton,
  SimulationHUD,
  SimulationIconButton,
  SimulationMetric,
  SimulationPanel,
  SimulationSlider,
  SimulationSurface,
  SimulationTimeline,
  SimulationToolbar,
} from "@/components/simulation-ui";

const domains = [
  { id: "biology", label: "Biology" },
  { id: "physics", label: "Physics" },
  { id: "astronomy", label: "Astronomy" },
  { id: "chemistry", label: "Chemistry" },
  { id: "geology", label: "Geology" },
];

export default function SimulationUiShowcase() {
  const [domain, setDomain] = useState("biology");
  const [value, setValue] = useState(42);
  const [time, setTime] = useState(120);
  const [playing, setPlaying] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top, rgba(15,118,110,0.18), transparent 36%), linear-gradient(180deg, #07111f 0%, #020617 100%)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto" }}>
        <Stack spacing={1.25} sx={{ mb: 3 }}>
          <Typography
            component="h1"
            sx={{
              color: "#f8fafc",
              fontSize: { xs: 30, sm: 40, md: 52 },
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            Esbiko Simulation UI
          </Typography>
          <Typography sx={{ color: "rgba(226,232,240,0.72)", maxWidth: 820 }}>
            Responsive reference page for the shared simulation controls, panels, HUD, metrics, and timeline.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
          {domains.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              clickable
              onClick={() => setDomain(item.id)}
              variant={domain === item.id ? "filled" : "outlined"}
              sx={{
                minHeight: 44,
                color: domain === item.id ? "#020617" : "#e2e8f0",
                backgroundColor: domain === item.id ? "#f8fafc" : "rgba(15,23,42,0.65)",
                borderColor: "rgba(148,163,184,0.28)",
                fontWeight: 800,
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.45fr) minmax(320px, 0.55fr)" },
            gap: 2,
          }}
        >
          <Stack spacing={2} minWidth={0}>
            <SimulationSurface
              domain={domain}
              sx={{
                minHeight: { xs: 420, md: 560 },
                p: 2,
                overflow: "visible",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 380, md: 520 },
                  borderRadius: 3,
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at 50% 42%, rgba(52,211,153,0.18), transparent 22%), radial-gradient(circle at 22% 24%, rgba(56,189,248,0.15), transparent 20%), linear-gradient(160deg, #0f172a, #020617)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: "18% 12%",
                    borderRadius: "50%",
                    border: "1px solid rgba(148,163,184,0.18)",
                    boxShadow: "inset 0 0 80px rgba(52,211,153,0.08)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "40%",
                    left: `${Math.max(8, Math.min(84, value))}%`,
                    width: { xs: 58, md: 76 },
                    height: { xs: 58, md: 76 },
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle at 35% 30%, #f0fdf4, #34d399 30%, #047857 72%)",
                    boxShadow: "0 0 44px rgba(52,211,153,0.48)",
                    transition: "left 220ms ease",
                  }}
                />
                <SimulationHUD position="top-left">
                  <Stack spacing={1}>
                    <SimulationMetric
                      domain={domain}
                      label="Selected domain"
                      value={domain}
                      helperText="Shared theme contract"
                      emphasis
                    />
                    <SimulationMetric
                      domain={domain}
                      label="Simulation time"
                      value={time}
                      unit="Myr"
                    />
                  </Stack>
                </SimulationHUD>
                <SimulationHUD position="bottom-right">
                  <SimulationToolbar domain={domain}>
                    <SimulationIconButton label="Play" domain={domain} onClick={() => setPlaying(true)}>
                      <PlayArrowRoundedIcon />
                    </SimulationIconButton>
                    <SimulationIconButton label="Reset" domain={domain} onClick={() => { setTime(120); setValue(42); setPlaying(false); }}>
                      <RestartAltRoundedIcon />
                    </SimulationIconButton>
                    <SimulationIconButton label="Information" domain={domain}>
                      <InfoOutlinedIcon />
                    </SimulationIconButton>
                  </SimulationToolbar>
                </SimulationHUD>
              </Box>
            </SimulationSurface>

            <SimulationTimeline
              domain={domain}
              label="Evolutionary time"
              value={time}
              min={0}
              max={500}
              step={5}
              unit="Myr"
              playing={playing}
              onChange={(_, nextValue) => setTime(nextValue)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onReset={() => { setTime(0); setPlaying(false); }}
              onStepBackward={() => setTime((current) => Math.max(0, current - 5))}
              onStepForward={() => setTime((current) => Math.min(500, current + 5))}
            />
          </Stack>

          <Stack spacing={2} minWidth={0}>
            <SimulationPanel
              domain={domain}
              title="Control Panel"
              subtitle="Shared responsive controls"
              icon={<ScienceRoundedIcon />}
            >
              <Stack spacing={2.5}>
                <SimulationSlider
                  domain={domain}
                  label="Environmental intensity"
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(_, nextValue) => setValue(nextValue)}
                />
                <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1}>
                  <SimulationButton domain={domain} startIcon={<PlayArrowRoundedIcon />} onClick={() => setPlaying(true)}>
                    Start simulation
                  </SimulationButton>
                  <SimulationButton domain={domain} simulationVariant="secondary" onClick={() => setPlaying(false)}>
                    Pause
                  </SimulationButton>
                  <SimulationButton domain={domain} simulationVariant="subtle" onClick={() => { setValue(42); setTime(120); setPlaying(false); }}>
                    Reset values
                  </SimulationButton>
                </Stack>
              </Stack>
            </SimulationPanel>

            <SimulationPanel domain={domain} title="Scientific Metrics" subtitle="Reusable HUD data blocks">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", lg: "1fr" },
                  gap: 1.25,
                }}
              >
                <SimulationMetric domain={domain} label="Timeline" value={time} unit="Myr" emphasis />
                <SimulationMetric domain={domain} label="Intensity" value={value} unit="%" />
                <SimulationMetric domain={domain} label="Playback" value={playing ? "Running" : "Paused"} />
                <SimulationMetric domain={domain} label="Viewport" value="Responsive" helperText="320 px and above" />
              </Box>
            </SimulationPanel>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
