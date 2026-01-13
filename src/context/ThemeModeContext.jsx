// src/context/ThemeModeContext.jsx
import { createContext, useContext } from "react";

export const ThemeModeContext = createContext({
  mode: "light",
  toggleTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
