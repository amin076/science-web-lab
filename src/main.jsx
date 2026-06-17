import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";
import ThemeModeProvider from "@/context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import { initAnalytics } from "./services/analytics";
import { initClarity } from "./services/clarity";

initAnalytics();
initClarity();

registerSW({
  immediate: true,
});

createRoot(document.getElementById("root")).render(
  <ThemeModeProvider>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ThemeModeProvider>,
);


