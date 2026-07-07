import { Box } from "@mui/material";

const DEFAULT_PADDING_X = {
  xs: "max(16px, var(--esbiko-safe-left, 0px))",
  sm: 3,
  md: 4,
};

export default function ResponsiveContainer({
  children,
  component = "div",
  maxWidth = 1200,
  disableSafeArea = false,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        width: "100%",
        maxWidth,
        mx: "auto",
        px: disableSafeArea ? { xs: 2, sm: 3, md: 4 } : DEFAULT_PADDING_X,
        minWidth: 0,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
