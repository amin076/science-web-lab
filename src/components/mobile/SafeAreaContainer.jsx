import { Box } from "@mui/material";

const EDGE_TO_PADDING = {
  top: "paddingTop",
  right: "paddingRight",
  bottom: "paddingBottom",
  left: "paddingLeft",
};

function buildSafeAreaPadding(edges) {
  return edges.reduce((acc, edge) => {
    const property = EDGE_TO_PADDING[edge];
    if (property) {
      acc[property] = `var(--esbiko-safe-${edge}, 0px)`;
    }
    return acc;
  }, {});
}

export default function SafeAreaContainer({
  children,
  component = "div",
  edges = ["top", "right", "bottom", "left"],
  fullHeight = false,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        ...(fullHeight && { minHeight: "100dvh" }),
        ...buildSafeAreaPadding(edges),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
