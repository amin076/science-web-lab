// ✅ src/components/dashboard/DashboardDrawer.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import ClassIcon from "@mui/icons-material/Class";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardDrawer() {
  const theme = useTheme();
  const { user, role, logout } = useAuth(); // ✅ همیشه بالا، بدون شرط
  const [open, setOpen] = useState(false);

  // اگر هنوز کاربر وارد نشده، فقط چیزی نمایش نده
  if (!user) {
    return null;
  }

  const isDark = theme.palette.mode === "dark";
  const displayRole = role || "student";
  const name =
    user?.email?.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "User";

  // مسیرها
  const links =
    displayRole === "teacher"
      ? [
          { icon: <DashboardIcon />, text: "Dashboard", path: "/dashboard/teacher" },
          { icon: <ClassIcon />, text: "My Classes", path: "/dashboard/create-class" },
          { icon: <ScienceIcon />, text: "Assign Experiments", path: "#" },
        ]
      : [
          { icon: <DashboardIcon />, text: "Dashboard", path: "/dashboard/student" },
          { icon: <ScienceIcon />, text: "My Experiments", path: "#" },
          { icon: <ClassIcon />, text: "My Classes", path: "#" },
        ];

  return (
    <>
      {/* 🌟 Floating Button */}
      <Tooltip title={open ? "Close Dashboard" : "Open Dashboard"}>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            position: "fixed",
            right: open ? 320 : 20,
            top: 120,
            zIndex: 2000,
            color: "#fff",
            background: "linear-gradient(135deg,#2563eb,#38bdf8)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            "&:hover": { transform: "scale(1.1)", transition: "all 0.2s ease-in-out" },
          }}
        >
          {open ? <CloseRoundedIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Tooltip>

      {/* 🌈 Drawer Panel */}
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ duration: 0.4 }}
            sx={{
              position: "fixed",
              top: 80,
              right: 0,
              bottom: 0,
              width: 320,
              background: isDark
                ? "linear-gradient(180deg,#0f172a,#1e3a8a,#3b82f6)"
                : "linear-gradient(180deg,#e0f2fe,#bae6fd,#60a5fa)",
              color: isDark ? "#f8fafc" : "#0f172a",
              boxShadow: "-2px 0 20px rgba(0,0,0,0.3)",
              borderTopLeftRadius: "16px",
              zIndex: 1500,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 3, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <Typography variant="h6" fontWeight={700}>
                {displayRole === "teacher" ? "👩‍🏫 Teacher Panel" : "👩‍🎓 Student Panel"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Hello, {name}
              </Typography>
            </Box>

            {/* Links */}
            <List sx={{ flex: 1 }}>
              {links.map((item) => (
                <ListItemButton
                  key={item.text}
                  component="a"
                  href={item.path}
                  sx={{
                    color: "inherit",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  {item.icon}
                  <ListItemText sx={{ ml: 2 }} primary={item.text} />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ opacity: 0.3 }} />

            {/* Logout */}
            <ListItemButton onClick={logout} sx={{ color: "inherit", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <LogoutIcon />
              <ListItemText sx={{ ml: 2 }} primary="Logout" />
            </ListItemButton>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
