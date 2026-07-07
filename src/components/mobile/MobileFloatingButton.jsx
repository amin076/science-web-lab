import { IconButton, Tooltip } from "@mui/material";

const POSITION_SX = {
  "top-left": {
    top: "calc(var(--esbiko-safe-top, 0px) + 16px)",
    left: "calc(var(--esbiko-safe-left, 0px) + 16px)",
  },
  "top-right": {
    top: "calc(var(--esbiko-safe-top, 0px) + 16px)",
    right: "calc(var(--esbiko-safe-right, 0px) + 16px)",
  },
  "bottom-left": {
    bottom: "calc(var(--esbiko-safe-bottom, 0px) + 16px)",
    left: "calc(var(--esbiko-safe-left, 0px) + 16px)",
  },
  "bottom-right": {
    bottom: "calc(var(--esbiko-safe-bottom, 0px) + 16px)",
    right: "calc(var(--esbiko-safe-right, 0px) + 16px)",
  },
};

export default function MobileFloatingButton({
  children,
  label,
  position = "bottom-right",
  sx = {},
  ...props
}) {
  const button = (
    <IconButton
      aria-label={label}
      sx={{
        position: "fixed",
        zIndex: 1400,
        minWidth: "var(--esbiko-touch-target, 44px)",
        minHeight: "var(--esbiko-touch-target, 44px)",
        color: "white",
        backgroundColor: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
        ...POSITION_SX[position],
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );

  return label ? <Tooltip title={label}>{button}</Tooltip> : button;
}
