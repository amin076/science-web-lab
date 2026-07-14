import { Box, Stack, Typography } from "@mui/material";

export default function SimulationInfoRail({
  eyebrow,
  title,
  description,
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
      <Stack spacing={0.7} sx={{ mb: 2 }}>
        {eyebrow && (
          <Typography sx={{ color: "#5eead4", fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {eyebrow}
          </Typography>
        )}
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 900, letterSpacing: "-0.03em" }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ color: "rgba(226,232,240,0.68)", fontSize: 13, lineHeight: 1.65 }}>
            {description}
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.2}>
        {sections.map((section, index) => (
          <Box
            key={section.id || section.title || index}
            sx={{
              p: 1.4,
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {section.title && (
              <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 850, color: "rgba(248,250,252,0.88)" }}>
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
