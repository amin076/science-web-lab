// ✅ src/context/ThemeModeContext.jsx
import { createContext, useContext } from "react";

export const ThemeModeContext = createContext(null);

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within <ThemeModeProvider />");
  }
  return ctx;
}
