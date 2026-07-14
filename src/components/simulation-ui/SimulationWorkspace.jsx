import { Box } from "@mui/material";

export default function SimulationWorkspace({
  children,
  leftPanel,
  rightPanel,
  bottomRegion,
  sx = {},
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
        isolation: "isolate",
        background: "#020617",
        ...sx,
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>{children}</Box>

      {leftPanel && (
        <Box
          component="aside"
          sx={{
            position: { xs: "absolute", lg: "absolute" },
            zIndex: 30,
            top: { xs: 12, lg: 18 },
            bottom: { xs: "auto", lg: 98 },
            left: { xs: 12, lg: 18 },
            width: { xs: "min(360px, calc(100% - 24px))", lg: 310 },
            maxHeight: { xs: "42dvh", lg: "calc(100dvh - 116px)" },
            overflow: "auto",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: { xs: 18, lg: 24 },
            background: "linear-gradient(145deg, rgba(15,23,42,0.50), rgba(2,6,23,0.28))",
            backdropFilter: "blur(26px) saturate(150%)",
            WebkitBackdropFilter: "blur(26px) saturate(150%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.12)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          {leftPanel}
        </Box>
      )}

      {rightPanel && (
        <Box
          component="aside"
          sx={{
            position: "absolute",
            zIndex: 31,
            top: { xs: "auto", lg: 18 },
            right: { xs: 12, lg: 18 },
            bottom: { xs: 94, lg: 98 },
            width: { xs: "min(390px, calc(100% - 24px))", lg: 340 },
            maxHeight: { xs: "46dvh", lg: "calc(100dvh - 116px)" },
            overflow: "auto",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: { xs: 18, lg: 24 },
            background: "linear-gradient(145deg, rgba(15,23,42,0.55), rgba(2,6,23,0.30))",
            backdropFilter: "blur(30px) saturate(165%)",
            WebkitBackdropFilter: "blur(30px) saturate(165%)",
            boxShadow: "0 28px 90px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {rightPanel}
        </Box>
      )}

      {bottomRegion && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 35,
            left: { xs: 8, md: 18 },
            right: { xs: 8, md: 18 },
            bottom: { xs: 8, md: 14 },
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: { xs: 16, md: 22 },
            overflow: "hidden",
            background: "linear-gradient(180deg, rgba(15,23,42,0.48), rgba(2,6,23,0.30))",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            boxShadow: "0 20px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.12)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {bottomRegion}
        </Box>
      )}
    </Box>
  );
}
