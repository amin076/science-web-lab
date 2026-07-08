//src/components/layout/HamburgerMenu.jsx
import { useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/hooks/useAuth";
import { MobileDrawer } from "@/components/mobile";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/experiments", label: "Experiments" },
  { to: "/art-science", label: "Art & Science" },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const { user, logout } = useAuth();

  const toggle = (val) => () => setOpen(val);

  const role = localStorage.getItem("role");
  const dashboardPath =
    role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  // 🧠 گرفتن نام از email
  const displayName = user
    ? user.email
        .split("@")[0]
        .replace(/\./g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <>
      <IconButton
        onClick={toggle(true)}
        aria-label="open navigation"
        sx={{
          color: isDark ? "#f8fafc" : "#0f172a",
          "&:hover": { transform: "scale(1.05)" },
          transition: "transform 0.2s ease",
        }}
      >
        <MenuRoundedIcon />
      </IconButton>

      <MobileDrawer
        open={open}
        onClose={toggle(false)}
        paperSx={{
          background: isDark
            ? "linear-gradient(160deg, #0f172a, #1e3a8a, #3b82f6)"
            : "linear-gradient(160deg, #e0f2fe, #93c5fd, #60a5fa)",
          color: isDark ? "#f8fafc" : "#0f172a",
        }}
      >
        {/* 🔝 Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Menu
          </Typography>
          <IconButton
            onClick={toggle(false)}
            aria-label="close navigation"
            sx={{ color: "inherit" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider sx={{ opacity: 0.25 }} />

        {/* 👤 User Info */}
        {user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 2,
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#3b82f6",
                width: 40,
                height: 40,
                fontSize: "1rem",
                textTransform: "uppercase",
              }}
            >
              {user.email[0]}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Hi, {displayName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 🔗 Links */}
        <List sx={{ p: 0 }}>
          {LINKS.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <ListItemButton
                key={to}
                component={NavLink}
                to={to}
                onClick={toggle(false)}
                sx={{
                  px: 3,
                  py: 1.25,
                  "&.active, &[aria-current=page]": {
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                  ...(active && { backgroundColor: "rgba(255,255,255,0.12)" }),
                }}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}

          {/* 🧭 Dashboard link */}
          {user && (
            <ListItemButton
              component={NavLink}
              to={dashboardPath}
              onClick={toggle(false)}
              sx={{
                px: 3,
                py: 1.25,
                "&.active, &[aria-current=page]": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          )}
        </List>

        <Divider sx={{ opacity: 0.25, my: 1 }} />

        {/* ⚙️ Auth actions */}
        <Box sx={{ px: 3, py: 2 }}>
          {user ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => {
                logout();
                localStorage.removeItem("role");
                navigate("/login");
                toggle(false)();
              }}
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.4)",
                "&:hover": {
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239,68,68,0.15)",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  navigate("/login");
                  toggle(false)();
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  navigate("/register");
                  toggle(false)();
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </MobileDrawer>
    </>
  );
}
