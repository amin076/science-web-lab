import { Box, Stack, Typography } from "@mui/material";

export default function SimulationToolRail({
  title,
  subtitle,
  actions,
  sections = [],
  sx = {},
}) {
  return (
    <Box
      sx={{
        color: "#f8fafc",
        background: "transparent",
        p: { xs: 1.75, md: 2 },
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.025em" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ mt: 0.4, color: "rgba(226,232,240,0.62)", fontSize: 12.5, lineHeight: 1.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Stack>

      <Stack spacing={1.15}>
        {sections.map((section, index) => (
          <Box
            key={section.id || section.title || index}
            sx={{
              p: 1.45,
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.11)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09), 0 10px 30px rgba(0,0,0,0.10)",
              transition: "border-color 180ms ease, background 180ms ease, transform 180ms ease",
              "&:hover": {
                borderColor: "rgba(94,234,212,0.24)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.035))",
              },
            }}
          >
            {section.title && (
              <Typography sx={{ mb: 1.15, fontSize: 12, fontWeight: 900, color: "rgba(248,250,252,0.88)", letterSpacing: "0.025em" }}>
                {section.title}
              </Typography>
            )}
            {section.content}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
