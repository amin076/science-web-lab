import { Box } from "@mui/material";

export default function MobileToolbar({
  children,
  component = "div",
  sticky = false,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        minHeight: 56,
        px: { xs: 2, sm: 3 },
        py: 1,
        pt: sticky ? "calc(var(--esbiko-safe-top, 0px) + 8px)" : undefined,
        ...(sticky && {
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(16px)",
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
