import { Stack } from "@mui/material";
import SimulationSurface from "./SimulationSurface";

export default function SimulationToolbar({
  children,
  domain = "default",
  direction = "row",
  wrap = true,
  justifyContent = "flex-start",
  sx = {},
  ...props
}) {
  return (
    <SimulationSurface
      domain={domain}
      sx={{
        display: "inline-flex",
        width: "auto",
        maxWidth: "100%",
        borderRadius: "16px",
        ...sx,
      }}
      {...props}
    >
      <Stack
        direction={direction}
        alignItems="center"
        justifyContent={justifyContent}
        spacing={1}
        useFlexGap
        flexWrap={wrap ? "wrap" : "nowrap"}
        sx={{ p: 1 }}
      >
        {children}
      </Stack>
    </SimulationSurface>
  );
}
