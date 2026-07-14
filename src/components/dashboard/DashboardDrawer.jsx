import { useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import ClassIcon from "@mui/icons-material/Class";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MobileDrawer } from "@/components/mobile";

const DESKTOP_DRAWER_WIDTH = 320;

export default function DashboardDrawer() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const displayRole = role || "student";
  const isDark = theme.palette.mode === "dark";

  const links =
    displayRole === "teacher"
      ? [
          {
            icon: <DashboardIcon />,
            label: "Dashboard",
            to: "/dashboard/teacher",
          },
          {
            icon: <ClassIcon />,
            label: "Create Class",
            to: "/dashboard/create-class",
          },
          {
            icon: <ScienceIcon />,
            label: "Experiments",
            to: "/experiments",
          },
        ]
      : [
          {
            icon: <DashboardIcon />,
            label: "Dashboard",
            to: "/dashboard/student",
          },
          {
            icon: <ClassIcon />,
            label: "Join Class",
            to: "/dashboard/join-class",
          },
          {
            icon: <ScienceIcon />,
            label: "Experiments",
            to: "/experiments",
          },
        ];

  const closeDrawer = () => setOpen(false);

  const handleLogout = async () => {
    closeDrawer();
    await logout();
    navigate("/");
  };

  const drawerContent = (
    <Box
      role="navigation"
      aria-label={`${displayRole} dashboard navigation`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: isDark ? "#f8fafc" : "#0f172a",
        background: isDark
          ? "linear-gradient(180deg,#0f172a,#1e3a8a,#2563eb)"
          : "linear-gradient(180deg,#eff6ff,#dbeafe,#93c5fd)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} noWrap>
            {displayRole === "teacher" ? "Teacher Panel" : "Student Panel"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.82 }} noWrap>
            {user.displayName || user.email || "Esbiko member"}
          </Typography>
        </Box>

        <IconButton
          aria-label="Close dashboard navigation"
          onClick={closeDrawer}
          sx={{
            minWidth: 44,
            minHeight: 44,
            color: "inherit",
            flexShrink: 0,
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {links.map((item) => {
          const selected =
            item.to === "/experiments"
              ? location.pathname.startsWith(item.to)
              : location.pathname === item.to;

          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={selected}
              onClick={closeDrawer}
              sx={{
                minHeight: 48,
                mb: 0.75,
                borderRadius: 2,
                color: "inherit",
                "&.Mui-selected": {
                  bgcolor: "rgba(255,255,255,0.22)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 800 : 600 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.18)" }} />

      <ListItemButton
        onClick={handleLogout}
        sx={{
          minHeight: 52,
          mx: 1.5,
          my: 1.5,
          borderRadius: 2,
          color: "inherit",
        }}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 700 }} />
      </ListItemButton>
    </Box>
  );

  return (
    <>
      <Tooltip title={open ? "Close dashboard menu" : "Open dashboard menu"}>
        <IconButton
          aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          sx={{
            position: "fixed",
            right: {
              xs: "max(12px, var(--esbiko-safe-right, 0px))",
              sm: "max(18px, var(--esbiko-safe-right, 0px))",
              md: open ? DESKTOP_DRAWER_WIDTH + 16 : 16,
            },
            top: { xs: 88, md: 120 },
            zIndex: theme.zIndex.drawer + 2,
            minWidth: 48,
            minHeight: 48,
            color: "#fff",
            background: "linear-gradient(135deg,#2563eb,#38bdf8)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.32)",
            transition: theme.transitions.create(["right", "transform"]),
            "&:hover": {
              background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)",
              transform: "scale(1.04)",
            },
          }}
        >
          {open ? <CloseRoundedIcon /> : <MenuOpenRoundedIcon />}
        </IconButton>
      </Tooltip>

      <MobileDrawer
        anchor="right"
        open={open}
        onClose={closeDrawer}
        width={isDesktop ? `${DESKTOP_DRAWER_WIDTH}px` : "min(88vw, 340px)"}
        ModalProps={{ keepMounted: true }}
        paperSx={{
          top: isDesktop ? 80 : 0,
          height: isDesktop ? "calc(100dvh - 80px)" : "100dvh",
          borderTopLeftRadius: { xs: 0, md: 16 },
          overflow: "hidden",
          boxShadow: "-8px 0 30px rgba(15,23,42,0.28)",
        }}
      >
        {drawerContent}
      </MobileDrawer>
    </>
  );
}
