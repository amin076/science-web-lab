import { Drawer } from "@mui/material";

export default function MobileDrawer({
  children,
  anchor = "right",
  width = "min(86vw, 320px)",
  paperSx = {},
  PaperProps,
  ...props
}) {
  return (
    <Drawer
      anchor={anchor}
      PaperProps={{
        ...PaperProps,
        sx: {
          width,
          maxWidth: "100vw",
          pt: "var(--esbiko-safe-top, 0px)",
          pr: anchor === "right" ? "var(--esbiko-safe-right, 0px)" : 0,
          pb: "var(--esbiko-safe-bottom, 0px)",
          pl: anchor === "left" ? "var(--esbiko-safe-left, 0px)" : 0,
          overflowX: "hidden",
          ...PaperProps?.sx,
          ...paperSx,
        },
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
}
