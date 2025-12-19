// ✅ src/App.jsx
import { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import AuthProvider from "@/context/AuthProvider";

import { lightTheme, darkTheme } from "@/theme";
import Layout from "@/components/layout/Layout";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";

// 🔐 Auth context
import ProtectedRoute from "@/components/common/ProtectedRoute";

// 🧑‍🏫 Dashboards
import TeacherDashboard from "@/pages/dashboard/TeacherDashboard";
import StudentDashboard from "@/pages/dashboard/StudentDashboard";
import CreateClassForm from "@/pages/dashboard/CreateClassForm";
import StudentClassDetail from "@/pages/dashboard/StudentClassDetail";
import StudentExperiment from "@/pages/dashboard/StudentExperiment";
import TeacherClassDetail from "@/pages/dashboard/TeacherClassDetail";

// ▶️ Run Simulation (Fullscreen)
import RunSimulation from "@/pages/simulations/RunSimulation";

// 📄 Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Experiments from "@/pages/Experiments";
import ExperimentDetail from "@/pages/ExperimentDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StyleGuide from "@/pages/StyleGuide";

// ✅ Layout wrapper for normal pages only
function LayoutShell({ onThemeToggle }) {
  return (
    <Layout>
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 20,
          zIndex: 2000,
        }}
      >
        <ThemeSwitcher onToggle={onThemeToggle} />
      </Box>

      <Outlet />
    </Layout>
  );
}

export default function App() {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");
  const theme = mode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    document.body.style.backgroundColor =
      mode === "light" ? "#f5f5f5" : "#0f172a";
    document.body.style.transition = "background-color 0.6s ease";
  }, [mode]);

  const handleThemeToggle = (newMode) => {
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* ✅ Fullscreen routes OUTSIDE Layout */}
            <Route
              path="/experiments/:id/run"
              element={
                <ProtectedRoute>
                  <RunSimulation />
                </ProtectedRoute>
              }
            />

            {/* ✅ Everything else INSIDE Layout */}
            <Route element={<LayoutShell onThemeToggle={handleThemeToggle} />}>
              {/* 🔓 Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/style-guide" element={<StyleGuide />} />

              {/* 🔒 Experiments */}
              <Route
                path="/experiments"
                element={
                  <ProtectedRoute>
                    <Experiments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/experiments/:id"
                element={
                  <ProtectedRoute>
                    <ExperimentDetail />
                  </ProtectedRoute>
                }
              />

              {/* 🧑‍🏫 Teacher Dashboard */}
              <Route
                path="/dashboard/teacher"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-class"
                element={
                  <ProtectedRoute>
                    <CreateClassForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/class/:id"
                element={
                  <ProtectedRoute>
                    <TeacherClassDetail />
                  </ProtectedRoute>
                }
              />

              {/* 👩‍🎓 Student Dashboard */}
              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/student/class/:id"
                element={
                  <ProtectedRoute>
                    <StudentClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/student/class/:classId/experiment/:expId"
                element={
                  <ProtectedRoute>
                    <StudentExperiment />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
