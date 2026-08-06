import { Box, Stack, Typography } from "@mui/material";
import SimulationSurface from "./SimulationSurface";

export default function SimulationPanel({
  title,
  subtitle,
  icon,
  actions,
  children,
  footer,
  domain = "default",
  compact = false,
  scrollable = false,
  sx = {},
  bodySx = {},
  ...props
}) {
  return (
    <SimulationSurface domain={domain} sx={{ width: "100%", ...sx }} {...props}>
      {(title || subtitle || icon || actions) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: compact ? 1.5 : 2,
            py: compact ? 1.25 : 1.75,
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
            {icon && (
              <Box sx={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
                {icon}
              </Box>
            )}
            <Box minWidth={0}>
              {title && (
                <Typography
                  sx={{
                    color: "rgba(248, 250, 252, 0.96)",
                    fontWeight: 800,
                    fontSize: compact ? 14 : 16,
                    lineHeight: 1.25,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  sx={{
                    mt: 0.35,
                    color: "rgba(203, 213, 225, 0.64)",
                    fontSize: 12,
                    lineHeight: 1.45,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Stack>
      )}

      <Box
        sx={{
          p: compact ? 1.5 : 2,
          minWidth: 0,
          ...(scrollable && {
            overflowY: "auto",
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
          }),
          ...bodySx,
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            px: compact ? 1.5 : 2,
            py: compact ? 1.25 : 1.5,
            borderTop: "1px solid rgba(148, 163, 184, 0.14)",
            background: "rgba(15, 23, 42, 0.28)",
          }}
        >
          {footer}
        </Box>
      )}
    </SimulationSurface>
  );
}
