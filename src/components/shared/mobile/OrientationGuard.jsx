import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const DISMISS_KEY = "esbiko:orientation-advice-dismissed";

function getViewportState() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isPortrait: false,
      canShowGuard: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= 900 || height <= 600;
  const isPortrait = height > width;

  return {
    isMobile,
    isPortrait,
    canShowGuard: isMobile && isPortrait,
  };
}

function getInitialDismissed() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

export default function OrientationGuard({
  enabled = true,
  blocking = false,
  dismissible = true,
  title = "Rotate your device",
  message = "Landscape mode gives simulations more room, but portrait mode is still available.",
}) {
  const [viewport, setViewport] = useState(() => getViewportState());
  const [dismissed, setDismissed] = useState(() => getInitialDismissed());

  useEffect(() => {
    const update = () => setViewport(getViewportState());

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    if (!viewport.canShowGuard) {
      setDismissed(false);

      try {
        window.sessionStorage.removeItem(DISMISS_KEY);
      } catch {
        // Storage may be unavailable in restricted browser contexts.
      }
    }
  }, [viewport.canShowGuard]);

  const shouldShow = useMemo(
    () => enabled && viewport.canShowGuard && (!dismissible || !dismissed),
    [dismissed, dismissible, enabled, viewport.canShowGuard],
  );

  const continueInPortrait = () => {
    setDismissed(true);

    try {
      window.sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // The in-memory state is sufficient when storage is unavailable.
    }
  };

  const enterFullscreenAndLandscape = async () => {
    try {
      const root = document.documentElement;

      if (!document.fullscreenElement && root.requestFullscreen) {
        await root.requestFullscreen();
      }

      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch {
          // Some browsers only permit orientation locking on installed PWAs.
        }
      }

      setViewport(getViewportState());
    } catch {
      // Fullscreen remains an optional enhancement.
    }
  };

  if (!shouldShow) return null;

  return (
    <Box
      role={blocking ? "dialog" : "status"}
      aria-modal={blocking ? true : undefined}
      aria-label="Device orientation advice"
      sx={{
        position: "fixed",
        inset: blocking ? 0 : "auto 0 0 0",
        zIndex: 1500,
        display: "flex",
        alignItems: blocking ? "center" : "flex-end",
        justifyContent: "center",
        p: {
          xs: "max(12px, var(--esbiko-safe-bottom, 0px)) 12px",
          sm: 2,
        },
        pointerEvents: blocking ? "auto" : "none",
        background: blocking ? "rgba(2, 6, 23, 0.86)" : "transparent",
        backdropFilter: blocking ? "blur(10px)" : "none",
      }}
    >
      <Box
        sx={{
          width: "min(100%, 460px)",
          borderRadius: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          textAlign: "center",
          color: "#f8fafc",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.98))",
          border: "1px solid rgba(148, 163, 184, 0.28)",
          boxShadow: "0 18px 50px rgba(2,6,23,0.48)",
          pointerEvents: "auto",
        }}
      >
        <ScreenRotationIcon
          aria-hidden="true"
          sx={{ fontSize: { xs: 46, sm: 56 }, color: "#7dd3fc", mb: 0.75 }}
        />

        <Typography
          component="h2"
          variant="h5"
          fontWeight={900}
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 0.75, color: "rgba(226,232,240,0.88)", lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            startIcon={<FullscreenIcon />}
            onClick={enterFullscreenAndLandscape}
            sx={{ minHeight: 44, px: 2.25, borderRadius: 999 }}
          >
            Enter fullscreen
          </Button>

          {dismissible && (
            <Button
              variant="outlined"
              startIcon={<CheckRoundedIcon />}
              onClick={continueInPortrait}
              sx={{
                minHeight: 44,
                px: 2.25,
                borderRadius: 999,
                color: "#e2e8f0",
                borderColor: "rgba(226,232,240,0.42)",
                "&:hover": {
                  borderColor: "#e2e8f0",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Continue in portrait
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
