import { useState } from "react";
import { Box, Chip, Divider, Stack, Switch, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  SimulationButton,
  SimulationHUD,
  SimulationIconButton,
  SimulationInfoRail,
  SimulationMetric,
  SimulationSlider,
  SimulationTimeline,
  SimulationToolRail,
  SimulationToolbar,
  SimulationWorkspace,
} from "@/components/simulation-ui";

export default function SimulationWorkspaceShowcase() {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(205);
  const [intensity, setIntensity] = useState(42);
  const [labels, setLabels] = useState(true);

  const reset = () => {
    setPlaying(false);
    setTime(205);
    setIntensity(42);
  };

  const infoPanel = (
    <SimulationInfoRail
      eyebrow="Life Data Stream"
      title="Cambrian Seas"
      description="Explore organisms, habitats, evolutionary relationships and environmental evidence while preserving a large scientific viewport."
      sections={[
        {
          title: "Educational Note",
          content: (
            <Typography sx={{ lineHeight: 1.65 }}>
              The Cambrian records a major diversification of animal body plans. The relationships displayed here are educational reconstructions and do not automatically imply direct ancestry.
            </Typography>
          ),
        },
        {
          title: "Environment",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <SimulationMetric label="Oxygen" value="12–18" unit="%" />
              <SimulationMetric label="Ocean" value="Warm" />
              <SimulationMetric label="Time" value={time} unit="Myr" emphasis />
              <SimulationMetric label="Evidence" value="Fossils" />
            </Box>
          ),
        },
        {
          title: "Major Organisms",
          content: (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label="Trilobites" />
              <Chip label="Anomalocaris" />
              <Chip label="Hallucigenia" />
              <Chip label="Early chordates" />
            </Stack>
          ),
        },
      ]}
    />
  );

  const controlPanel = (
    <SimulationToolRail
      title="Evolution Lab"
      subtitle="Objects, environment, view and playback"
      actions={
        <SimulationButton simulationVariant="subtle" onClick={reset}>
          Reset
        </SimulationButton>
      }
      sections={[
        {
          title: "Playback",
          content: (
            <Stack direction="row" spacing={1}>
              <SimulationButton
                startIcon={playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? "Pause" : "Play"}
              </SimulationButton>
              <SimulationIconButton label="Reset timeline" onClick={() => setTime(0)}>
                <RestartAltRoundedIcon />
              </SimulationIconButton>
            </Stack>
          ),
        },
        {
          title: "Environment",
          content: (
            <SimulationSlider
              label="Environmental intensity"
              value={intensity}
              min={0}
              max={100}
              unit="%"
              onChange={(_, value) => setIntensity(value)}
            />
          ),
        },
        {
          title: "Visible Layers",
          content: (
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Species labels</Typography>
                <Switch checked={labels} onChange={(event) => setLabels(event.target.checked)} />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Food web</Typography>
                <Switch defaultChecked />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Environment</Typography>
                <Switch defaultChecked />
              </Stack>
            </Stack>
          ),
        },
        {
          title: "Active Organisms",
          content: (
            <Stack divider={<Divider flexItem sx={{ borderColor: "rgba(148,163,184,0.12)" }} />}>
              {["Anomalocaris", "Trilobite", "Hallucigenia"].map((name) => (
                <Box key={name} sx={{ py: 1 }}>
                  <Typography fontWeight={800}>{name}</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(203,213,225,0.62)" }}>
                    Selectable scientific entity
                  </Typography>
                </Box>
              ))}
            </Stack>
          ),
        },
      ]}
    />
  );

  return (
    <SimulationWorkspace
      leftPanel={infoPanel}
      rightPanel={controlPanel}
      bottomRegion={
        <SimulationTimeline
          label="Evolutionary time"
          value={time}
          min={0}
          max={540}
          step={1}
          unit="Myr"
          playing={playing}
          onChange={(_, value) => setTime(value)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onReset={() => setTime(0)}
          onStepBackward={() => setTime((value) => Math.max(0, value - 5))}
          onStepForward={() => setTime((value) => Math.min(540, value + 5))}
          sx={{ borderRadius: 0, boxShadow: "none" }}
        />
      }
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 44%, rgba(34,197,94,0.18), transparent 22%), radial-gradient(circle at 20% 20%, rgba(14,165,233,0.14), transparent 24%), linear-gradient(180deg, #07111f, #020617)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "14% 8%",
            borderRadius: "48%",
            border: "1px solid rgba(94,234,212,0.18)",
            boxShadow: "inset 0 0 120px rgba(14,165,233,0.08)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: "46%",
            top: "46%",
            width: 120,
            height: 72,
            borderRadius: "55% 45% 50% 50%",
            transform: "translate(-50%,-50%) rotate(-8deg)",
            background: "linear-gradient(145deg,#86efac,#15803d)",
            boxShadow: "0 0 44px rgba(34,197,94,0.45)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "30%",
            top: "58%",
            width: 58,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#bae6fd,#0369a1)",
            boxShadow: "0 0 24px rgba(56,189,248,0.36)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "68%",
            top: "35%",
            width: 74,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#fde68a,#b45309)",
            boxShadow: "0 0 28px rgba(245,158,11,0.32)",
          }}
        />

        {labels && (
          <>
            <Typography sx={{ position: "absolute", left: "46%", top: "38%", color: "#f8fafc", fontWeight: 900 }}>
              Anomalocaris
            </Typography>
            <Typography sx={{ position: "absolute", left: "27%", top: "52%", color: "#f8fafc", fontWeight: 800 }}>
              Trilobite
            </Typography>
            <Typography sx={{ position: "absolute", left: "66%", top: "28%", color: "#f8fafc", fontWeight: 800 }}>
              Hallucigenia
            </Typography>
          </>
        )}

        <SimulationHUD position="top-right">
          <SimulationToolbar>
            <SimulationIconButton
              label="Play or pause"
              selected={playing}
              onClick={() => setPlaying((current) => !current)}
            >
              {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            </SimulationIconButton>
            <SimulationIconButton label="Reset" onClick={reset}>
              <RestartAltRoundedIcon />
            </SimulationIconButton>
            <SimulationIconButton label="Information">
              <InfoOutlinedIcon />
            </SimulationIconButton>
          </SimulationToolbar>
        </SimulationHUD>
      </Box>
    </SimulationWorkspace>
  );
}
