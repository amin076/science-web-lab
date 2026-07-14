import { Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SimulationIconButton from "./SimulationIconButton";
import SimulationSlider from "./SimulationSlider";
import SimulationSurface from "./SimulationSurface";

export default function SimulationTimeline({
  value,
  min,
  max,
  step = 1,
  unit,
  label = "Timeline",
  playing = false,
  domain = "default",
  marks,
  disabled = false,
  onChange,
  onPlay,
  onPause,
  onReset,
  onStepBackward,
  onStepForward,
  valueFormatter,
  sx = {},
}) {
  return (
    <SimulationSurface domain={domain} sx={{ width: "100%", ...sx }}>
      <Stack spacing={1.25} sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
          <SimulationIconButton
            label={playing ? "Pause timeline" : "Play timeline"}
            domain={domain}
            selected={playing}
            disabled={disabled}
            onClick={playing ? onPause : onPlay}
          >
            {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </SimulationIconButton>
          <SimulationIconButton
            label="Step backward"
            domain={domain}
            disabled={disabled || !onStepBackward}
            onClick={onStepBackward}
          >
            <SkipPreviousRoundedIcon />
          </SimulationIconButton>
          <SimulationIconButton
            label="Step forward"
            domain={domain}
            disabled={disabled || !onStepForward}
            onClick={onStepForward}
          >
            <SkipNextRoundedIcon />
          </SimulationIconButton>
          <SimulationIconButton
            label="Reset timeline"
            domain={domain}
            disabled={disabled || !onReset}
            onClick={onReset}
          >
            <RestartAltRoundedIcon />
          </SimulationIconButton>

          <Typography
            sx={{
              ml: { sm: "auto" },
              color: "rgba(203, 213, 225, 0.62)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Scientific time
          </Typography>
        </Stack>

        <SimulationSlider
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          unit={unit}
          marks={marks}
          disabled={disabled}
          onChange={onChange}
          valueFormatter={valueFormatter}
          domain={domain}
        />
      </Stack>
    </SimulationSurface>
  );
}
