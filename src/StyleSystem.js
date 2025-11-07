// 🌈 src/styleSystem.js
// ----------------------------------------------------------
// این فایل مرکز هماهنگی تمام رنگ‌ها، سایه‌ها، فونت‌ها، radius، glow و motion در Science Web Lab است
// هر تغییری در این فایل، در کل اپلیکیشن اعمال می‌شود 👇
// ----------------------------------------------------------

// 🎨 رنگ‌ها
export const colors = {
  primary: "#2563eb",
  secondary: "#38bdf8",
  accent: "#60a5fa",
  backgroundLight: "#f5f5f5",
  backgroundDark: "#0f172a",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  gradientBlue: "linear-gradient(90deg,#0a3d62,#2563eb)",
  gradientCyan: "linear-gradient(90deg,#2563eb,#38bdf8,#60a5fa)",
  glow: "rgba(56,189,248,0.7)",
};

// 🧱 Radius (گوشه‌ها)
export const radius = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  round: "50%",
};

// 🪶 سایه‌ها (Shadows)
export const shadows = {
  soft: "0 4px 12px rgba(0,0,0,0.15)",
  medium: "0 6px 18px rgba(0,0,0,0.2)",
  strong: "0 10px 25px rgba(0,0,0,0.3)",
  glowBlue:
    "0 0 15px rgba(37,99,235,0.5), 0 0 25px rgba(37,99,235,0.4), 0 0 40px rgba(56,189,248,0.25)",
};

// ⏱ ترنزیشن‌ها
export const transitions = {
  fast: "all 0.2s ease-in-out",
  normal: "all 0.35s ease-in-out",
  slow: "all 0.6s ease-in-out",
};

// 📏 فاصله‌های استاندارد (Spacing)
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

// ✍️ سیستم تایپوگرافی (Typography)
export const typography = {
  fontPrimary: "Poppins, Roboto, sans-serif",
  headingWeight: 700,
  bodyWeight: 400,
  sizes: {
    h1: "2.5rem",
    h2: "2rem",
    h3: "1.75rem",
    body: "1rem",
    small: "0.875rem",
  },
};

// ✨ افکت‌های Glow و Hover عمومی
export const glowEffects = {
  // برای کارت‌ها، دکمه‌ها، آیکون‌ها
  hoverGlow: {
    whileHover: {
      scale: 1.03,
      y: -5,
      boxShadow:
        "0 0 15px rgba(56,189,248,0.5), 0 0 30px rgba(56,189,248,0.3)",
    },
    transition: { duration: 0.4, ease: "easeInOut" },
  },

  // برای متن‌ها (مثل لینک‌ها یا برند)
  textGlow: {
    textShadow: "0 0 12px rgba(56,189,248,0.7)",
    color: "#60a5fa",
    transition: "all 0.3s ease-in-out",
  },

  // حالت تپنده (Pulse)
  pulse: {
    animate: {
      boxShadow: [
        "0 0 0px rgba(56,189,248,0)",
        "0 0 12px rgba(56,189,248,0.6)",
        "0 0 25px rgba(56,189,248,0.8)",
        "0 0 12px rgba(56,189,248,0.6)",
        "0 0 0px rgba(56,189,248,0)",
      ],
    },
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
