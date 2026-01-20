// ✅ src/App.jsx
import AppErrorBoundary from "@/components/system/AppErrorBoundary";
import SimulationBoundary from "@/components/system/SimulationBoundary";
import { Box } from "@mui/material"; // Removed ThemeProvider, CssBaseline
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import AuthProvider from "@/context/AuthProvider";

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

// ✅ LayoutShell doesn't need props anymore
function LayoutShell() {
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
        {/* ThemeSwitcher uses Context internally, no props needed */}
        <ThemeSwitcher />
      </Box>

      <Outlet />
    </Layout>
  );
}

export default function App() {
  // 🗑️ DELETED: Local state, useEffect, and handleThemeToggle.
  // The ThemeModeProvider in main.jsx handles all of this now.

  return (
    // 🗑️ DELETED: <ThemeProvider> and <CssBaseline> (Already in main.jsx)
    <AuthProvider>
      <AppErrorBoundary>
        <Router>
          <Routes>
            {/* ✅ Fullscreen routes */}
            <Route
              path="/experiments/:id/run"
              element={
                <ProtectedRoute>
                  <SimulationBoundary>
                    <RunSimulation />
                  </SimulationBoundary>
                </ProtectedRoute>
              }
            />

            {/* ✅ Everything else INSIDE Layout */}
            <Route element={<LayoutShell />}>
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
      </AppErrorBoundary>
    </AuthProvider>
  );
}
