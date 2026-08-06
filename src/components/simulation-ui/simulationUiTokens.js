export const simulationUiTokens = {
  radius: {
    small: 10,
    control: 14,
    panel: 20,
    modal: 26,
    pill: 999,
  },
  control: {
    minTouchSize: 44,
    compactHeight: 40,
    defaultHeight: 46,
    largeHeight: 52,
  },
  panel: {
    compactWidth: 320,
    defaultWidth: 380,
    wideWidth: 520,
    mobileMaxHeight: "36dvh",
  },
  viewport: {
    minWidth: 320,
    qualityDpr: {
      low: 1,
      balanced: 2,
      high: 2.5,
      recording: 3,
    },
  },
  safeArea: {
    top: "env(safe-area-inset-top, 0px)",
    right: "env(safe-area-inset-right, 0px)",
    bottom: "env(safe-area-inset-bottom, 0px)",
    left: "env(safe-area-inset-left, 0px)",
  },
  zIndex: {
    viewport: 0,
    hud: 18,
    toolbar: 19,
    timeline: 20,
    panel: 30,
    drawer: 40,
    recording: 50,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  blur: {
    surface: 16,
    elevated: 24,
  },
  motion: {
    fast: 120,
    standard: 220,
    slow: 420,
  },
  shadow: {
    surface: "0 18px 50px rgba(0, 0, 0, 0.26)",
    control: "0 8px 24px rgba(0, 0, 0, 0.22)",
    focus: "0 0 0 3px rgba(56, 189, 248, 0.28)",
  },
};

export const simulationDomainThemes = {
  default: {
    accent: "#38bdf8",
    accentStrong: "#0284c7",
    accentSoft: "rgba(56, 189, 248, 0.18)",
  },
  physics: {
    accent: "#38bdf8",
    accentStrong: "#0369a1",
    accentSoft: "rgba(56, 189, 248, 0.18)",
  },
  astronomy: {
    accent: "#a78bfa",
    accentStrong: "#7c3aed",
    accentSoft: "rgba(167, 139, 250, 0.18)",
  },
  biology: {
    accent: "#34d399",
    accentStrong: "#059669",
    accentSoft: "rgba(52, 211, 153, 0.18)",
  },
  geology: {
    accent: "#fb923c",
    accentStrong: "#ea580c",
    accentSoft: "rgba(251, 146, 60, 0.18)",
  },
  chemistry: {
    accent: "#22d3ee",
    accentStrong: "#0891b2",
    accentSoft: "rgba(34, 211, 238, 0.18)",
  },
};

export function getSimulationDomainTheme(domain = "default") {
  return simulationDomainThemes[domain] || simulationDomainThemes.default;
}
