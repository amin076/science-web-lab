import { Box } from "@mui/material";

const positionStyles = {
  "top-left": { top: 12, left: 12 },
  "top-right": { top: 12, right: 12 },
  "bottom-left": { bottom: 12, left: 12 },
  "bottom-right": { bottom: 12, right: 12 },
};

export default function SimulationHUD({
  children,
  position = "top-left",
  interactive = true,
  maxWidth = 420,
  sx = {},
  ...props
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        zIndex: 20,
        width: "min-content",
        maxWidth: `min(${maxWidth}px, calc(100% - 24px))`,
        pointerEvents: interactive ? "auto" : "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        ...positionStyles[position],
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
