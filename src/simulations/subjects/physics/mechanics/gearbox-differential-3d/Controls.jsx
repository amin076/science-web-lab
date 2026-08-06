import { Box, Stack, Switch, Typography } from "@mui/material";
import SimulationPanel from "@/components/simulation-ui/SimulationPanel";
import SimulationSlider from "@/components/simulation-ui/SimulationSlider";
import { CONTROL_SCHEMA } from "./schema";
import { clamp, formatNumber } from "./constants";

export default function Controls({ params, setParam }) {
  const numericControls = CONTROL_SCHEMA.filter((control) => control.type === "number");
  const toggles = CONTROL_SCHEMA.filter((control) => control.type === "toggle");

  return (
    <SimulationPanel
      title="Controls"
      subtitle={`${CONTROL_SCHEMA.length} bounded inputs`}
      domain="physics"
      compact
    >
      <Stack spacing={1.2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1.1,
          }}
        >
          {numericControls.map((control) => {
            const raw = params[control.key];
            const value = Number.isFinite(raw) ? raw : control.defaultValue;

            return (
              <Box
                key={control.key}
                sx={{
                  minWidth: 0,
                  p: 1.45,
                  borderRadius: 2,
                  border: "1px solid rgba(148,163,184,0.14)",
                  background:
                    "linear-gradient(145deg, rgba(15,23,42,0.62), rgba(2,6,23,0.32))",
                }}
              >
                <SimulationSlider
                  label={control.label}
                  value={value}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  unit={control.unit}
                  domain="physics"
                  valueFormatter={(nextValue) => formatNumber(nextValue, control.step < 0.1 ? 2 : 1)}
                  onChange={(_, nextValue) => {
                    const numberValue = Array.isArray(nextValue) ? nextValue[0] : nextValue;
                    setParam(
                      control.key,
                      clamp(Number.isFinite(numberValue) ? numberValue : control.defaultValue, control.min, control.max),
                    );
                  }}
                />
                {control.help && (
                  <Typography sx={{ mt: 0.35, color: "rgba(203,213,225,0.54)", fontSize: 11.5, lineHeight: 1.45 }}>
                    {control.help}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack spacing={0.85}>
          {toggles.map((control) => {
            const checked = Boolean(params[control.key]);

            return (
              <Box
                key={control.key}
                component="label"
                sx={{
                  minHeight: 58,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.2,
                  p: 1.25,
                  borderRadius: 2,
                  border: checked
                    ? "1px solid rgba(56,189,248,0.38)"
                    : "1px solid rgba(148,163,184,0.14)",
                  background: checked
                    ? "linear-gradient(145deg, rgba(56,189,248,0.16), rgba(15,23,42,0.58))"
                    : "rgba(15,23,42,0.38)",
                  cursor: "pointer",
                }}
              >
                <Box minWidth={0}>
                  <Typography sx={{ color: "rgba(248,250,252,0.92)", fontSize: 13.5, fontWeight: 850 }}>
                    {control.label}
                  </Typography>
                  {control.help && (
                    <Typography sx={{ mt: 0.25, color: "rgba(203,213,225,0.52)", fontSize: 11.5, lineHeight: 1.35 }}>
                      {control.help}
                    </Typography>
                  )}
                </Box>
                <Switch
                  checked={checked}
                  onChange={() => setParam(control.key, !checked)}
                  inputProps={{ "aria-label": control.label }}
                  sx={{
                    flexShrink: 0,
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#67e8f9",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#0891b2",
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </SimulationPanel>
  );
}
