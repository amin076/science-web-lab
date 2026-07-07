import { Stack } from "@mui/material";

export default function ResponsiveStack({
  children,
  direction = { xs: "column", md: "row" },
  spacing = { xs: 2, md: 3 },
  alignItems = { xs: "stretch", md: "center" },
  wrap = false,
  sx = {},
  ...props
}) {
  return (
    <Stack
      direction={direction}
      spacing={spacing}
      alignItems={alignItems}
      sx={{
        minWidth: 0,
        ...(wrap && { flexWrap: "wrap" }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}
