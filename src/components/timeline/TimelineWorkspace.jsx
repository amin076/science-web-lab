import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import "./timelineWorkspace.css";

function JourneyLibrary({ journeys, selectedJourneyId, onSelectJourney }) {
  return (
    <Paper className="timeline-journeys" elevation={0}>
      <Typography className="timeline-kicker">Journey library</Typography>
      <Typography className="timeline-panel-title">Follow a lineage</Typography>
      <Stack spacing={1} className="timeline-journey-list">
        {journeys.map((journey) => (
          <Button
            key={journey.id}
            className="timeline-journey-button"
            data-active={journey.id === selectedJourneyId}
            onClick={() => onSelectJourney(journey.id)}
          >
            <span className="timeline-journey-icon" aria-hidden="true">
              {journey.icon || "●"}
            </span>
            <span className="timeline-journey-copy">
              <strong>{journey.label}</strong>
              <small>{journey.description || `${journey.timeline?.length || 0} stages`}</small>
            </span>
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}

function StageViewport({ stage, media }) {
  return (
    <Paper className="timeline-stage" elevation={0}>
      <Box className="timeline-stage-scene" style={{ "--timeline-stage-color": stage.color || "#39d8ca" }}>
        {media?.type === "image" && media.src ? (
          <img src={media.src} alt={media.alt || stage.title || stage.label} />
        ) : media?.render ? (
          media.render(stage)
        ) : (
          <Box className="timeline-stage-fallback" role="img" aria-label={`${stage.label} stage illustration`}>
            <span className="timeline-stage-symbol" aria-hidden="true">{stage.icon || "✦"}</span>
            <span className="timeline-orbit timeline-orbit-one" />
            <span className="timeline-orbit timeline-orbit-two" />
          </Box>
        )}
        <Box className="timeline-stage-overlay">
          <Typography className="timeline-stage-time">{stage.time}</Typography>
          <Typography component="h2" className="timeline-stage-title">{stage.title || stage.label}</Typography>
          <Typography className="timeline-stage-summary">{stage.summary}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function TimelineHUD({ stage, onOpenDetails }) {
  const metrics = [
    stage.era && ["Era", stage.era],
    stage.dominantLife && ["Dominant life", stage.dominantLife],
    stage.oxygen && ["Oxygen", stage.oxygen],
    stage.temperature && ["Temperature", stage.temperature],
  ].filter(Boolean);

  return (
    <Paper className="timeline-hud" elevation={0}>
      <Typography className="timeline-kicker">Stage HUD</Typography>
      <Typography className="timeline-panel-title">{stage.label}</Typography>
      <Typography className="timeline-hud-summary">{stage.summary}</Typography>
      <Stack spacing={1} className="timeline-metrics">
        {metrics.map(([label, value]) => (
          <Box className="timeline-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </Box>
        ))}
      </Stack>
      <Button startIcon={<InfoOutlinedIcon />} className="timeline-details-button" onClick={onOpenDetails}>
        Read full stage details
      </Button>
    </Paper>
  );
}

function SimulationTimeline({ stages, currentIndex, onChange, isPlaying, onTogglePlay, onReset }) {
  return (
    <Paper className="timeline-controller" elevation={0}>
      <Box className="timeline-era-strip" aria-label="Timeline eras">
        {[...new Set(stages.map((item) => item.era).filter(Boolean))].map((era) => (
          <span key={era}>{era}</span>
        ))}
      </Box>
      <Box className="timeline-event-strip">
        {stages.map((stage, index) => (
          <button
            type="button"
            key={stage.id || `${stage.label}-${index}`}
            className="timeline-event"
            data-active={index === currentIndex}
            onClick={() => onChange(index)}
            aria-label={`Go to ${stage.label}`}
          >
            <span>{stage.icon || "●"}</span>
            <small>{stage.label}</small>
          </button>
        ))}
      </Box>
      <Slider
        min={0}
        max={Math.max(0, stages.length - 1)}
        step={1}
        value={currentIndex}
        onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
        aria-label="Timeline stage"
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
        <Stack direction="row" gap={0.5}>
          <IconButton aria-label="Previous stage" disabled={currentIndex === 0} onClick={() => onChange(currentIndex - 1)}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <IconButton aria-label={isPlaying ? "Pause timeline" : "Play timeline"} onClick={onTogglePlay}>
            {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </IconButton>
          <IconButton aria-label="Next stage" disabled={currentIndex === stages.length - 1} onClick={() => onChange(currentIndex + 1)}>
            <ArrowForwardRoundedIcon />
          </IconButton>
          <IconButton aria-label="Reset timeline" onClick={onReset}>
            <RestartAltRoundedIcon />
          </IconButton>
        </Stack>
        <Typography className="timeline-position">{currentIndex + 1} / {stages.length}</Typography>
      </Stack>
    </Paper>
  );
}

export default function TimelineWorkspace({
  title,
  subtitle,
  journeys,
  selectedJourneyId,
  onSelectJourney,
  stages,
  currentIndex,
  onChangeStage,
  isPlaying,
  onTogglePlay,
  onReset,
  media,
  onBack,
}) {
  const [journeysOpen, setJourneysOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const stage = stages[currentIndex] || stages[0];
  const journey = journeys.find((item) => item.id === selectedJourneyId) || journeys[0];

  if (!stage) return null;

  return (
    <Box className="timeline-workspace">
      <Box className="timeline-header">
        <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
          {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowBackRoundedIcon /></IconButton>}
          <Box minWidth={0}>
            <Typography className="timeline-header-kicker">{subtitle}</Typography>
            <Typography component="h1" className="timeline-header-title">{title}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1}>
          <Button className="timeline-mobile-journeys" startIcon={<MenuRoundedIcon />} onClick={() => setJourneysOpen(true)}>
            Journeys
          </Button>
          <Button className="timeline-mobile-details" startIcon={<InfoOutlinedIcon />} onClick={() => setDetailsOpen(true)}>
            Details
          </Button>
          <Button variant="contained" startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />} onClick={onTogglePlay}>
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </Stack>
      </Box>

      <Box className="timeline-grid">
        <Box className="timeline-desktop-journeys">
          <JourneyLibrary journeys={journeys} selectedJourneyId={selectedJourneyId} onSelectJourney={onSelectJourney} />
        </Box>
        <Box className="timeline-main">
          <Box className="timeline-current-journey">
            <Typography>{journey?.icon} {journey?.label}</Typography>
            <Typography>{stages.length} stages</Typography>
          </Box>
          <StageViewport stage={stage} media={media} />
        </Box>
        <Box className="timeline-desktop-hud">
          <TimelineHUD stage={stage} onOpenDetails={() => setDetailsOpen(true)} />
        </Box>
        <Box className="timeline-bottom">
          <SimulationTimeline
            stages={stages}
            currentIndex={currentIndex}
            onChange={onChangeStage}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onReset={onReset}
          />
        </Box>
      </Box>

      {journeysOpen && (
        <Drawer open onClose={() => setJourneysOpen(false)} transitionDuration={0}>
          <Box className="timeline-drawer">
          <IconButton aria-label="Close journeys" onClick={() => setJourneysOpen(false)}><CloseRoundedIcon /></IconButton>
          <JourneyLibrary
            journeys={journeys}
            selectedJourneyId={selectedJourneyId}
            onSelectJourney={(id) => { onSelectJourney(id); setJourneysOpen(false); }}
          />
          </Box>
        </Drawer>
      )}

      {detailsOpen && (
        <Drawer anchor="right" open onClose={() => setDetailsOpen(false)} transitionDuration={0}>
          <Box className="timeline-details-drawer">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography component="h2">{stage.title || stage.label}</Typography>
            <IconButton aria-label="Close details" onClick={() => setDetailsOpen(false)}><CloseRoundedIcon /></IconButton>
          </Stack>
          <Typography className="timeline-details-time">{stage.time} · {stage.era}</Typography>
          <Typography>{stage.summary}</Typography>
          {stage.dominantLife && <><Typography component="h3">Dominant life</Typography><Typography>{stage.dominantLife}</Typography></>}
          {stage.details && <><Typography component="h3">Scientific perspective</Typography><Typography>{stage.details}</Typography></>}
          {Array.isArray(stage.references) && stage.references.length > 0 && <><Typography component="h3">References</Typography><ul>{stage.references.map((item) => <li key={item}>{item}</li>)}</ul></>}
          </Box>
        </Drawer>
      )}
    </Box>
  );
}

export { JourneyLibrary, SimulationTimeline, StageViewport, TimelineHUD };
