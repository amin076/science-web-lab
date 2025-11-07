// ✅ src/motion.js
export const motionConfig = {
  variants: {
    // انیمیشن ورود از پایین (برای صفحات و کارت‌ها)
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },

    // انیمیشن محو شدن نرم (برای جزئیات و مودال‌ها)
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },

    // افکت درخشش تپنده (Glow Pulse)
    glowPulse: {
      rest: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
      hover: {
        scale: 1.03,
        boxShadow:
          "0 0 25px rgba(56,189,248,0.5), 0 0 40px rgba(56,189,248,0.35)",
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
    },

    // حرکت موجی برای لینک‌ها (Wave motion)
    wave: {
      rest: { opacity: 0.8 },
      hover: {
        opacity: 1,
        textShadow:
          "0 0 10px rgba(37,99,235,0.8), 0 0 20px rgba(56,189,248,0.6)",
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    },
  },

  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },

  ease: {
    inOut: [0.4, 0, 0.2, 1],
  },
};
