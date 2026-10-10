import { Box, Stack, Typography } from "@mui/material";
import SimulationPanel from "./SimulationPanel";
import SimulationSurface from "./SimulationSurface";
import { getSimulationDomainTheme } from "./simulationUiTokens";

const typeLabels = {
  "2d": "2D standard",
  "3d": "3D standard",
  timeline: "Timeline standard",
};

export default function SimulationStandardWorkspace({
  title,
  subtitle,
  simulationType = "2d",
  domain = "default",
  viewport,
  controls,
  hud,
  timeline,
  info,
  toolbar,
  recordingControls,
  recordingMode = false,
  hideChromeInRecording = true,
  unifiedPanel = false,
  viewportLabel = "Simulation viewport",
  sx = {},
}) {
  const theme = getSimulationDomainTheme(domain);
  const chromeHidden = recordingMode && hideChromeInRecording;

  return (
    <Box
      data-simulation-type={simulationType}
      data-recording-mode={recordingMode ? "true" : "false"}
      sx={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        minHeight: 0,
        overflow: "auto",
        isolation: "isolate",
        color: "#f8fafc",
        background:
          "#080811",
        pt: "env(safe-area-inset-top, 0px)",
        pr: "env(safe-area-inset-right, 0px)",
        pb: "env(safe-area-inset-bottom, 0px)",
        pl: "env(safe-area-inset-left, 0px)",
        ...sx,
      }}
    >
      <Box
        sx={{
          height: { xs: "auto", lg: "100%" },
          minHeight: "100%",
          display: "grid",
          gap: { xs: 1, md: 1.5 },
          p: { xs: 1, md: 1.5 },
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: !chromeHidden && (controls || info || recordingControls) ? "minmax(0, 1fr) minmax(320px, 380px)" : "minmax(0, 1fr)",
          },
          gridTemplateRows: {
            xs: chromeHidden || !controls ? "minmax(320px, 100dvh)" : "minmax(320px, 56dvh) auto",
            lg: "minmax(0, 1fr)",
          },
        }}
      >
        <SimulationSurface
          domain={domain}
          contentSx={{ height: "100%", minHeight: 0 }}
          sx={{
            height: "100%",
            minHeight: 0,
            borderRadius: { xs: "16px", md: "24px" },
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.42), rgba(2,6,23,0.72))",
          }}
        >
          <Box
            role="region"
            aria-label={viewportLabel}
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
              background: "#020617",
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1.5}
              sx={{
                position: "absolute",
                zIndex: 15,
                top: { xs: 10, md: 14 },
                left: { xs: 10, md: 14 },
                right: { xs: 10, md: 14 },
                pointerEvents: "none",
                display: chromeHidden && !hud ? "none" : "flex",
              }}
            >
              <Box minWidth={0}>
                {(title || subtitle) && (
                  <Box
                    sx={{
                      maxWidth: "min(580px, 78vw)",
                      textShadow: "0 2px 18px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Typography
                      component="h2"
                      sx={{
                        color: "rgba(248,250,252,0.98)",
                        fontSize: { xs: 18, md: 23 },
                        fontWeight: 900,
                        lineHeight: 1.08,
                      }}
                    >
                      {title}
                    </Typography>
                    {subtitle && (
                      <Typography
                        sx={{
                          mt: 0.45,
                          color: "rgba(226,232,240,0.68)",
                          fontSize: { xs: 11.5, md: 12.5 },
                          lineHeight: 1.45,
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  flexShrink: 0,
                  px: 1,
                  py: 0.55,
                  border: `1px solid ${theme.accentSoft}`,
                  borderRadius: 999,
                  color: theme.accent,
                  background: "rgba(2,6,23,0.62)",
                  backdropFilter: "blur(14px)",
                  fontSize: 11,
                  fontWeight: 850,
                  letterSpacing: 0,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {typeLabels[simulationType] || "Simulation standard"}
              </Box>
            </Stack>

            {viewport}

            {hud && (
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 18,
                  left: { xs: 10, md: 14 },
                  right: { xs: 10, sm: "auto" },
                  bottom: timeline && !chromeHidden ? { xs: 116, md: 126 } : { xs: 10, md: 14 },
                  maxWidth: { xs: "none", sm: 430 },
                  pointerEvents: "auto",
                }}
              >
                {hud}
              </Box>
            )}

            {!chromeHidden && toolbar && (
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 19,
                  right: { xs: 10, md: 14 },
                  bottom: timeline ? { xs: 116, md: 126 } : { xs: 10, md: 14 },
                  maxWidth: "calc(100% - 20px)",
                }}
              >
                {toolbar}
              </Box>
            )}

            {!chromeHidden && timeline && (
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 20,
                  left: { xs: 8, md: 14 },
                  right: { xs: 8, md: 14 },
                  bottom: { xs: 8, md: 14 },
                }}
              >
                {timeline}
              </Box>
            )}

            {recordingMode && (
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  inset: { xs: 8, md: 14 },
                  zIndex: 16,
                  border: "1px dashed rgba(248,250,252,0.42)",
                  borderRadius: "16px",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        </SimulationSurface>

        {!chromeHidden && (controls || info || recordingControls) && (
          <Box
            component="aside"
            aria-label="Simulation controls"
            sx={{
              minHeight: 0,
              overflow: "auto",
              overscrollBehavior: "contain",
              ...(unifiedPanel && {
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: { xs: "16px", md: "24px" },
                background: "#05050c",
                px: { xs: 1, md: 1.5 },
                py: 1.5,
                scrollbarWidth: "thin",
                "& [data-simulation-panel]": {
                  borderRadius: "0px", border: 0,
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                  background: "transparent", boxShadow: "none",
                  backdropFilter: "none",
                  "&::before": { display: "none" },
                },
                "& [data-simulation-panel] button": { borderRadius: "10px", boxShadow: "none" },
              }),
            }}
          >
            {unifiedPanel && <Box sx={{ px: 1.5, pb: 2, mb: 1, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <Typography component="h3" sx={{ fontSize: 22, fontWeight: 800 }}>Control Center</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: "#94a3b8" }}>Playback, camera & measurements</Typography>
            </Box>}
            <Stack spacing={unifiedPanel ? 1 : 1.2} sx={{ minHeight: 0 }}>
              {recordingControls && (
                <SimulationPanel title="Capture" domain={domain} compact>
                  {recordingControls}
                </SimulationPanel>
              )}
              {controls}
              {info}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
