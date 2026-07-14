import { useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Messages", path: "/admin/messages" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileDrawer = () => setMobileOpen(false);

  const drawerContent = (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "#0f172a",
        color: "white",
        pt: { xs: 1, md: 3 },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          Esbiko Admin
        </Typography>

        {!isDesktop && (
          <IconButton
            aria-label="Close admin navigation"
            onClick={closeMobileDrawer}
            sx={{ color: "white", minWidth: 44, minHeight: 44 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const selected =
            item.path === "/admin"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={selected}
              onClick={closeMobileDrawer}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mb: 0.75,
                color: "inherit",
                "&.Mui-selected": {
                  bgcolor: "rgba(59,130,246,0.28)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(59,130,246,0.36)",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 800 : 600 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        minWidth: 0,
        bgcolor: "#020617",
        color: "white",
      }}
    >
      {!isDesktop && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "rgba(15,23,42,0.96)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            pt: "var(--esbiko-safe-top, 0px)",
          }}
        >
          <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2 } }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Open admin navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, minWidth: 44, minHeight: 44 }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" component="div" fontWeight={800} noWrap>
              Esbiko Admin
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || mobileOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isDesktop ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "min(86vw, 320px)", md: DRAWER_WIDTH },
            maxWidth: "100vw",
            bgcolor: "#0f172a",
            color: "white",
            borderRight: "1px solid rgba(255,255,255,0.12)",
            pt: { xs: "var(--esbiko-safe-top, 0px)", md: 0 },
            pb: "var(--esbiko-safe-bottom, 0px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: {
            xs: "calc(64px + var(--esbiko-safe-top, 0px))",
            md: 0,
          },
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
