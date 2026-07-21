import { Box, Slider, Stack, Typography } from "@mui/material";
import {
  getSimulationDomainTheme,
  simulationUiTokens,
} from "./simulationUiTokens";

export default function SimulationSlider({
  label,
  value,
  unit,
  domain = "default",
  valueFormatter,
  min,
  max,
  step,
  marks,
  disabled,
  onChange,
  sx = {},
  ...props
}) {
  const domainTheme = getSimulationDomainTheme(domain);
  const formattedValue = valueFormatter ? valueFormatter(value) : value;

  return (
    <Box sx={{ width: "100%", minWidth: 0, ...sx }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={2}
      >
        <Typography
          sx={{
            color: "rgba(241, 245, 249, 0.88)",
            fontWeight: 650,
            fontSize: 13,
          }}
        >
          {label}
        </Typography>

        <Typography
          component="output"
          sx={{
            color: domainTheme.accent,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            fontSize: 13,
          }}
        >
          {formattedValue}
          {unit ? ` ${unit}` : ""}
        </Typography>
      </Stack>

      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        marks={marks}
        disabled={disabled}
        onChange={onChange}
        sx={{
          mt: 0.75,
          color: domainTheme.accent,
          height: 6,
          "& .MuiSlider-rail": {
            opacity: 1,
            background: "rgba(148, 163, 184, 0.22)",
          },
          "& .MuiSlider-track": {
            border: 0,
            background: `linear-gradient(90deg, ${domainTheme.accentStrong}, ${domainTheme.accent})`,
          },
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            background: "#f8fafc",
            border: `3px solid ${domainTheme.accent}`,
            boxShadow: simulationUiTokens.shadow.control,
            "&:focus-visible": {
              boxShadow: simulationUiTokens.shadow.focus,
            },
          },
          "& .MuiSlider-markLabel": {
            color: "rgba(203, 213, 225, 0.62)",
            fontSize: 11,
          },
        }}
        {...props}
      />
    </Box>
  );
}
