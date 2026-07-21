import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { evolutionSubjects, getEvolutionSubject } from "./data/speciesTimelines.js";
import {
  clampEvolutionIndex,
  formatEvolutionTime,
  getEvolutionProgress,
  getEvolutionStage,
} from "./model/evolutionModel";
import "./evolutionOfLife.css";

function MetricCard({ label, value, detail }) {
  return (
    <Paper className="evolution-metric" elevation={0}>
      <Typography className="evolution-metric-label">{label}</Typography>
      <Typography className="evolution-metric-value">{value}</Typography>
      {detail ? (
        <Typography className="evolution-metric-detail">{detail}</Typography>
      ) : null}
    </Paper>
  );
}

export default function EvolutionOfLifeSimulation() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("life");
  const selectedSubject = useMemo(
    () => getEvolutionSubject(selectedSubjectId),
    [selectedSubjectId],
  );
  const subjectTimeline = selectedSubject.timeline;
  const [stageIndex, setStageIndex] = useState(0);

  // data-multispecies-reset
  useEffect(() => {
    setStageIndex(0);
  }, [selectedSubjectId, setStageIndex]);
  const [playing, setPlaying] = useState(false);

  const stage = useMemo(() => getEvolutionStage(stageIndex), [stageIndex]);
  const progress = getEvolutionProgress(stageIndex) * 100;

  useEffect(() => {
    if (!playing) return undefined;

    const timer = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= subjectTimeline.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 2600);

    return () => window.clearInterval(timer);
  }, [playing]);

  const selectStage = (nextIndex) => {
    setStageIndex(clampEvolutionIndex(nextIndex));
  };

  const reset = () => {
    setPlaying(false);
    setStageIndex(0);
  };

  return (
    <Box
      className="evolution-page"
      style={{ "--stage-color": stage.color }}
    >
      <Box className="evolution-ambient evolution-ambient-one" />
      <Box className="evolution-ambient evolution-ambient-two" />

      <Box className="evolution-shell">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          className="evolution-heading"
        >
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="Biology" size="small" className="evolution-chip" />
              <Chip label="Evolution" size="small" className="evolution-chip" />
              <Chip label={stage.era} size="small" className="evolution-chip evolution-chip-active" />

        <Typography className="evolution-format-note" variant="body2">
          2D Canvas reference simulation for the Esbiko simulation standard
        </Typography>
      </Stack>
            <Typography component="h1" className="evolution-title">
              Evolution of Life
            </Typography>
            <Typography className="evolution-subtitle">
              Travel through 4.5 billion years of biological history and explore
              the environmental changes that shaped life on Earth.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={reset}
              className="evolution-secondary-button"
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setPlaying((value) => !value)}
              className="evolution-primary-button"
            >
              {playing ? "Pause" : "Play journey"}
            </Button>
          </Stack>
        </Stack>

        <Paper className="evolution-species-panel" elevation={0}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="overline" className="evolution-species-eyebrow">
              Explore a lineage
            </Typography>
            <Typography variant="h6">
              Select life history
            </Typography>
            <Typography variant="body2" className="evolution-species-description">
              Choose a subject, then move the timeline slider to explore its evolutionary stages.
            </Typography>
          </Box>
          <Box className="evolution-species-list">
            {evolutionSubjects.map((subject) => (
              <Button
                key={subject.id}
                type="button"
                variant={selectedSubjectId === subject.id ? "contained" : "outlined"}
                className={`evolution-species-button ${
                  selectedSubjectId === subject.id
                    ? "evolution-species-button-active"
                    : ""
                }`}
                onClick={() => setSelectedSubjectId(subject.id)}
                aria-pressed={selectedSubjectId === subject.id}
              >
                <span className="evolution-species-icon" aria-hidden="true">
                  {subject.icon || "●"}
                </span>
                <span>{subject.label}</span>
              </Button>
            ))}
          </Box>
          <Typography variant="body2" className="evolution-selected-subject">
            Showing: <strong>{selectedSubject.label}</strong> — {subjectTimeline.length} timeline stages
          </Typography>
        </Stack>
      </Paper>
      <Box className="evolution-grid">
          <Paper className="evolution-stage-card" elevation={0}>
            <Box className="evolution-stage-visual">
              <Box className="evolution-orbit evolution-orbit-one" />
              <Box className="evolution-orbit evolution-orbit-two" />
              <Box className="evolution-stage-icon" aria-hidden="true">
                {stage.icon}
              </Box>
            </Box>

            <Box className="evolution-stage-content">
              <Typography className="evolution-stage-time">
                {stage.time} · {formatEvolutionTime(stage.millionYearsAgo)}
              </Typography>
              <Typography component="h2" className="evolution-stage-title">
                {stage.title}
              </Typography>
              <Typography className="evolution-stage-summary">
                {stage.summary}
              </Typography>

              <Box className="evolution-dominant-life">
                <Typography className="evolution-dominant-label">
                  Dominant life
                </Typography>
                <Typography className="evolution-dominant-value">
                  {stage.dominantLife}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box className="evolution-side-column">
            <Box className="evolution-metrics-grid">
              <MetricCard
                label="Atmospheric oxygen"
                value={`${stage.oxygenPercent}%`}
                detail="Approximate global level"
              />
              <MetricCard
                label="Average temperature"
                value={`${stage.temperatureC} °C`}
                detail="Simplified estimate"
              />
              <MetricCard
                label="Biodiversity index"
                value={`${stage.biodiversity}/100`}
                detail="Relative visual indicator"
              />
            </Box>

            <Paper className="evolution-learning-card" elevation={0}>
              <Typography className="evolution-panel-eyebrow">
                Scientific perspective
              </Typography>
              <Typography className="evolution-panel-title">
                Evolution is a branching process
              </Typography>
              <Typography className="evolution-panel-copy">
                Species do not progress along one ladder. Populations branch,
                adapt, coexist and become extinct as environments change.
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Paper className="evolution-timeline-panel" elevation={0}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography className="evolution-panel-eyebrow">
                Interactive timeline
              </Typography>
              <Typography className="evolution-timeline-current">
                {stage.label}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5}>
              <IconButton
                aria-label="Previous evolutionary stage"
                onClick={() => selectStage(stageIndex - 1)}
                disabled={stageIndex === 0}
                className="evolution-icon-button"
              >
                <ArrowBackRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Next evolutionary stage"
                onClick={() => selectStage(stageIndex + 1)}
                disabled={stageIndex === subjectTimeline.length - 1}
                className="evolution-icon-button"
              >
                <ArrowForwardRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progress}
            className="evolution-progress"
          />

          <Slider
            value={stageIndex}
            min={0}
            max={subjectTimeline.length - 1}
            step={1}
            marks={subjectTimeline.map((item, index) => ({
              value: index,
              label:
                index === 0 ||
                index === subjectTimeline.length - 1 ||
                index === Math.floor(subjectTimeline.length / 2)
                  ? item.time
                  : "",
            }))}
            onChange={(_, value) => selectStage(value)}
            aria-label="Evolution timeline"
            className="evolution-slider"
          />

          <Box className="evolution-stage-buttons">
            {subjectTimeline.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={
                  index === stageIndex
                    ? "evolution-stage-button is-active"
                    : "evolution-stage-button"
                }
                onClick={() => selectStage(index)}
                aria-pressed={index === stageIndex}
              >
                <span className="evolution-stage-button-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
