import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeModeProvider } from "@/context/ThemeContext"; // ✅ اضافه شد

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🎨 تمام اپ را در ThemeModeProvider می‌پیچیم */}
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </StrictMode>
);
