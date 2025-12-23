// src/main.jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeModeProvider } from "@/context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <ThemeModeProvider>
    <App />
  </ThemeModeProvider>
);

// ✅ Register SW only in production
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("✅ Service Worker registered:", reg.scope))
      .catch((err) =>
        console.error("❌ Service Worker registration failed:", err)
      );
  });
}
