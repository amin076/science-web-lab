# Scroll Lock Strategy (SimulationLayout)

## Why this document exists

We had a bug where after opening a simulation (fullscreen overlay), the Experiments page could not scroll anymore.
The user had to refresh the browser to restore scrolling.

Root cause: scroll-lock was applied via `document.body.style.overflow = "hidden"` and the unlock relied on cleanup.
In real apps this can break when:

- A simulation crashes (ErrorBoundary / Suspense / runtime errors)
- Navigation order changes unexpectedly
- Multiple overlays try to lock/unlock scroll
- The page already had an overflow style before locking

So we standardize one scroll-lock mechanism.

---

## Rules (Do / Don't)

### ✅ DO

- Lock/unlock only through a single shared utility (one source of truth).
- Ensure unlock happens on:
  - normal unmount
  - back navigation (optional safety)
  - ErrorBoundary catch (safety net)

### ❌ DON'T

- Do not set `document.body.style.overflow` directly in random components.
- Do not create a new “fix component” for each scroll bug — fix the mechanism.

---

## Implementation

### 1) Shared Utility

Create:

src/utils/scrollLock.js

Responsibilities:

- Save previous inline styles once
- Support nested locks (reference counting)
- Provide force reset for error cases

```js
// src/utils/scrollLock.js

let lockCount = 0;
let saved = null;

export function lockScroll() {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    const body = document.body;
    saved = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    // Optional: prevent layout shift when scrollbar disappears
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }

  lockCount += 1;
}

export function unlockScroll(force = false) {
  if (typeof document === "undefined") return;

  if (force) {
    lockCount = 0;
  } else {
    lockCount = Math.max(0, lockCount - 1);
  }

  if (lockCount === 0 && saved) {
    const body = document.body;
    body.style.overflow = saved.overflow || "";
    body.style.paddingRight = saved.paddingRight || "";
    saved = null;
  }
}

export function resetScrollLock() {
  unlockScroll(true);
}
```

---

## 2) Where to use it

### A) SimulationLayout (main lifecycle)

File: src/components/layout/SimulationLayout.jsx

Lock on mount, unlock on unmount:

```jsx
import React, { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

export default function SimulationLayout({ children, onBack }) {
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  return <div style={{ position: "fixed", inset: 0 }}>{children}</div>;
}
```

### B) RunSimulation Back Navigation (optional safety)

If you want extra safety, force unlock before navigating:

```jsx
import { unlockScroll } from "@/utils/scrollLock";

const handleBack = () => {
  unlockScroll(true); // force unlock (safety)
  navigate("/experiments");
};
```

### C) Error Boundary Safety Net

If a simulation crashes before normal cleanup, force reset:

```jsx
import { resetScrollLock } from "@/utils/scrollLock";

componentDidCatch(error, info) {
  resetScrollLock();
}
```

---

## Testing checklist

1. Open a simulation → scroll must be locked (expected).
2. Click Back → Experiments page must scroll normally.
3. Force a simulation error → after error UI, scrolling must still work.
4. Open/close simulations repeatedly → scroll should never get stuck.
5. If nested overlays exist later → reference counting prevents wrong unlock.

---

## Notes

- This approach scales well as the app grows.
- One scroll-lock system, used everywhere.
- If scroll breaks again, check:
  - someone manually set `body.style.overflow`
  - a component locked but never unlocked
