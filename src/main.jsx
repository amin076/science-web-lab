import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeModeProvider } from "@/context/ThemeContext"; // ✅ Context

// ⚙️ React render
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </StrictMode>
);

// ✅ Register Service Worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) =>
        console.log("✅ Service Worker registered successfully:", reg.scope)
      )
      .catch((err) =>
        console.error("❌ Service Worker registration failed:", err)
      );
  });
}
