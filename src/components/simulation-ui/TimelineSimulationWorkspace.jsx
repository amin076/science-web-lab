import { useMemo, useState } from "react";
import { Box, ButtonBase, Drawer, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SimulationButton from "./SimulationButton";
import SimulationMetric from "./SimulationMetric";
import SimulationPanel from "./SimulationPanel";
import SimulationStandardWorkspace from "./SimulationStandardWorkspace";
import SimulationTimeline from "./SimulationTimeline";

function clampIndex(index, stages) {
  const maximum = Math.max(0, stages.length - 1);
  const numeric = Number(index);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(maximum, Math.round(numeric)));
}

function JourneySelector({ journeys, selectedJourneyId, onSelectJourney, domain }) {
  if (!journeys?.length) return null;

  return (
    <SimulationPanel title="Journeys" domain={domain} compact scrollable>
      <Stack spacing={0.85}>
        {journeys.map((journey) => {
          const selected = journey.id === selectedJourneyId;
          return (
            <ButtonBase
              key={journey.id}
              onClick={() => onSelectJourney?.(journey.id)}
              aria-pressed={selected}
              sx={{
                width: "100%",
                minHeight: 58,
                justifyContent: "flex-start",
                gap: 1.1,
                p: 1.1,
                borderRadius: 1.5,
                textAlign: "left",
                color: "#f8fafc",
                border: `1px solid ${selected ? "rgba(56,189,248,0.48)" : "rgba(148,163,184,0.14)"}`,
                background: selected ? "rgba(56,189,248,0.12)" : "rgba(15,23,42,0.44)",
              }}
            >
              <Typography sx={{ width: 30, flexShrink: 0, fontSize: 22, lineHeight: 1 }} aria-hidden="true">
                {journey.icon || "•"}
              </Typography>
              <Box minWidth={0}>
                <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.2 }}>
                  {journey.label || journey.title || journey.id}
                </Typography>
                {(journey.description || journey.timeline?.length) && (
                  <Typography
                    sx={{
                      mt: 0.35,
                      color: "rgba(203,213,225,0.58)",
                      fontSize: 11.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {journey.description || `${journey.timeline.length} stages`}
                  </Typography>
                )}
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>
    </SimulationPanel>
  );
}

function StageViewport({ stage, media, domain }) {
  const color = stage.color || "#38bdf8";

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(4,10,20,0.98), rgba(8,20,35,0.96))",
      }}
    >
      {media?.type === "image" && media.src ? (
        <Box
          component="img"
          src={media.src}
          alt={media.alt || stage.title || stage.label}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : media?.render ? (
        media.render(stage)
      ) : (
        <Box
          role="img"
          aria-label={`${stage.label || stage.title} stage illustration`}
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: `radial-gradient(circle at 50% 36%, ${color}33, transparent 36%)`,
          }}
        >
          <Typography
            aria-hidden="true"
            sx={{
              fontSize: { xs: 84, md: 132 },
              filter: `drop-shadow(0 0 28px ${color})`,
            }}
          >
            {stage.icon || "•"}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          p: { xs: 2, md: 3 },
          pb: { xs: 15, md: 17 },
          background: "linear-gradient(0deg, rgba(2,6,23,0.96), transparent)",
        }}
      >
        <Typography sx={{ color, fontSize: 13, fontWeight: 850 }}>
          {stage.time || stage.displayTime}
        </Typography>
        <Typography
          component="h2"
          sx={{
            mt: 0.5,
            maxWidth: 820,
            fontSize: { xs: 28, md: 42 },
            fontWeight: 900,
            lineHeight: 1.05,
          }}
        >
          {stage.title || stage.label}
        </Typography>
        {stage.summary && (
          <Typography
            sx={{
              mt: 1,
              maxWidth: 760,
              color: "rgba(226,232,240,0.76)",
              fontSize: { xs: 13.5, md: 15 },
              lineHeight: 1.55,
            }}
          >
            {stage.summary}
          </Typography>
        )}
        {domain && <span hidden>{domain}</span>}
      </Box>
    </Box>
  );
}

function StageHud({ stage, domain, onOpenDetails }) {
  const metrics = [
    stage.era && { label: "Era", value: stage.era },
    stage.phase && { label: "Phase", value: stage.phase },
    stage.dominantLife && { label: "Dominant life", value: stage.dominantLife },
    stage.temperature && { label: "Temperature", value: stage.temperature },
    stage.oxygen && { label: "Oxygen", value: stage.oxygen },
  ].filter(Boolean);

  return (
    <SimulationPanel title={stage.label || "Stage HUD"} domain={domain} compact>
      <Stack spacing={1}>
        {metrics.slice(0, 4).map((metric) => (
          <SimulationMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            domain={domain}
            sx={{ minHeight: 62 }}
          />
        ))}
        <SimulationButton
          domain={domain}
          simulationVariant="secondary"
          startIcon={<InfoOutlinedIcon />}
          onClick={onOpenDetails}
          sx={{ width: "100%" }}
        >
          Details
        </SimulationButton>
      </Stack>
    </SimulationPanel>
  );
}

export default function TimelineSimulationWorkspace({
  title,
  subtitle,
  domain = "biology",
  journeys = [],
  selectedJourneyId,
  onSelectJourney,
  stages = [],
  currentIndex = 0,
  onChangeStage,
  isPlaying = false,
  onPlay,
  onPause,
  onTogglePlay,
  onReset,
  onStepBackward,
  onStepForward,
  media,
  recordingControls,
}) {
  const [journeyDrawerOpen, setJourneyDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const safeIndex = clampIndex(currentIndex, stages);
  const stage = stages[safeIndex] || stages[0];

  const marks = useMemo(
    () =>
      stages.map((item, index) => ({
        value: index,
        label: item.shortLabel || item.label || String(index + 1),
      })),
    [stages],
  );

  if (!stage) return null;

  const changeStage = (nextIndex) => onChangeStage?.(clampIndex(nextIndex, stages));
  const previousStage = onStepBackward || (() => changeStage(safeIndex - 1));
  const nextStage = onStepForward || (() => changeStage(safeIndex + 1));
  const play = onPlay || onTogglePlay;
  const pause = onPause || onTogglePlay;

  const controls = (
    <>
      <SimulationPanel
        title="Timeline"
        actions={
          <SimulationButton
            domain={domain}
            simulationVariant="subtle"
            startIcon={<MenuRoundedIcon />}
            onClick={() => setJourneyDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            Journeys
          </SimulationButton>
        }
        domain={domain}
        compact
      >
        <Stack spacing={1.2}>
          <Typography sx={{ color: "rgba(203,213,225,0.66)", fontSize: 12.5 }}>
            {stage.summary}
          </Typography>
          <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
            {stages.map((item, index) => (
              <SimulationButton
                key={item.id || index}
                domain={domain}
                simulationVariant={index === safeIndex ? "secondary" : "subtle"}
                onClick={() => changeStage(index)}
                sx={{ minHeight: 38, px: 1.25, fontSize: 12 }}
              >
                {item.shortLabel || item.label || index + 1}
              </SimulationButton>
            ))}
          </Stack>
        </Stack>
      </SimulationPanel>

      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <JourneySelector
          journeys={journeys}
          selectedJourneyId={selectedJourneyId}
          onSelectJourney={onSelectJourney}
          domain={domain}
        />
      </Box>
    </>
  );

  return (
    <>
      <SimulationStandardWorkspace
        title={title}
        subtitle={subtitle}
        simulationType="timeline"
        domain={domain}
        viewport={<StageViewport stage={stage} media={media} domain={domain} />}
        hud={<StageHud stage={stage} domain={domain} onOpenDetails={() => setDetailsOpen(true)} />}
        controls={controls}
        recordingControls={recordingControls}
        timeline={
          <SimulationTimeline
            value={safeIndex}
            min={0}
            max={Math.max(0, stages.length - 1)}
            step={1}
            label="Stage"
            playing={isPlaying}
            domain={domain}
            marks={marks.length <= 8 ? marks : undefined}
            disabled={stages.length < 2}
            onChange={(_, value) => changeStage(Array.isArray(value) ? value[0] : value)}
            onPlay={play}
            onPause={pause}
            onReset={onReset}
            onStepBackward={safeIndex <= 0 ? undefined : previousStage}
            onStepForward={safeIndex >= stages.length - 1 ? undefined : nextStage}
            valueFormatter={() => `${safeIndex + 1} / ${stages.length}`}
          />
        }
      />

      <Drawer open={journeyDrawerOpen} onClose={() => setJourneyDrawerOpen(false)} transitionDuration={0}>
        <Box sx={{ width: "min(88vw, 390px)", minHeight: "100%", p: 1.5, background: "#07111f" }}>
          <Stack alignItems="flex-end" sx={{ mb: 1 }}>
            <SimulationButton
              domain={domain}
              simulationVariant="subtle"
              startIcon={<CloseRoundedIcon />}
              onClick={() => setJourneyDrawerOpen(false)}
            >
              Close
            </SimulationButton>
          </Stack>
          <JourneySelector
            journeys={journeys}
            selectedJourneyId={selectedJourneyId}
            onSelectJourney={(id) => {
              onSelectJourney?.(id);
              setJourneyDrawerOpen(false);
            }}
            domain={domain}
          />
        </Box>
      </Drawer>

      <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)} transitionDuration={0}>
        <Box
          sx={{
            width: "min(92vw, 430px)",
            minHeight: "100%",
            p: 2,
            color: "#f8fafc",
            background: "#07111f",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography component="h2" sx={{ fontSize: 22, fontWeight: 900 }}>
              {stage.title || stage.label}
            </Typography>
            <SimulationButton
              domain={domain}
              simulationVariant="subtle"
              startIcon={<CloseRoundedIcon />}
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </SimulationButton>
          </Stack>
          <Typography sx={{ mt: 1, color: "rgba(56,189,248,0.92)", fontWeight: 800 }}>
            {[stage.time || stage.displayTime, stage.era].filter(Boolean).join(" · ")}
          </Typography>
          {stage.summary && (
            <Typography sx={{ mt: 2, color: "rgba(226,232,240,0.78)", lineHeight: 1.65 }}>
              {stage.summary}
            </Typography>
          )}
          {stage.details && (
            <Typography sx={{ mt: 2.5, color: "rgba(226,232,240,0.78)", lineHeight: 1.65 }}>
              {stage.details}
            </Typography>
          )}
          {Array.isArray(stage.references) && stage.references.length > 0 && (
            <Box component="ul" sx={{ mt: 2, pl: 2.4, color: "rgba(226,232,240,0.72)" }}>
              {stage.references.map((reference) => (
                <li key={reference}>{reference}</li>
              ))}
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export { JourneySelector, StageHud, StageViewport };
