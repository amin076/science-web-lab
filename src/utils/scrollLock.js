// src/utils/scrollLock.js

let lockCount = 0;
let prev = null;

export function lockScroll() {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    prev = {
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
    };

    // Prevent layout jump when scrollbar disappears
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;
}

export function unlockScroll(force = false) {
  if (typeof document === "undefined") return;

  if (force) lockCount = 1; // force a full unlock

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0 && prev) {
    document.body.style.overflow = prev.bodyOverflow || "";
    document.documentElement.style.overflow = prev.htmlOverflow || "";
    document.body.style.paddingRight = prev.bodyPaddingRight || "";
    prev = null;
  }
}
