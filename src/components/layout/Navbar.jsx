import { NavLink, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";

import { useAuth } from "@/hooks/useAuth";

function Navbar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const dashboardPath =
    role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  const LinkItem = ({ to, label, icon: IconComp }) => (
    <Box key={to} sx={{ position: "relative" }}>
      <NavLink
        to={to}
        onClick={onClose}
        style={{ textDecoration: "none" }}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        {({ isActive }) => (
          <Typography
            component={motion.span}
            whileHover="hover"
            animate={isActive ? "hover" : "rest"}
            variants={{ rest: { color: "#fff" }, hover: { color: "#93c5fd" } }}
            transition={{ duration: 0.25 }}
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              pb: "4px",
              fontWeight: 600,
            }}
          >
            {IconComp ? <IconComp fontSize="small" /> : null}
            {label}
            <motion.span
              variants={{
                rest: { width: 0, opacity: 0 },
                hover: { width: "100%", opacity: 1 },
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 2,
                borderRadius: 2,
                background: "linear-gradient(90deg,#3b82f6,#38bdf8,#60a5fa)",
                boxShadow:
                  "0 0 8px rgba(56,189,248,0.8), 0 0 16px rgba(56,189,248,0.6)",
              }}
            />
          </Typography>
        )}
      </NavLink>
    </Box>
  );

  return (
    <Box
      component={motion.nav}
      sx={{
        display: "flex",
        gap: 3,
        alignItems: "center",
        background: "transparent",
      }}
    >
      <LinkItem to="/" icon={HomeRoundedIcon} label="Home" />
      <LinkItem to="/about" icon={InfoRoundedIcon} label="About" />
      <LinkItem to="/contact" icon={ContactMailRoundedIcon} label="Contact" />
      <LinkItem
        to="/experiments"
        icon={ScienceRoundedIcon}
        label="Experiments"
      />

      {!user ? (
        <>
          <LinkItem to="/login" icon={LoginRoundedIcon} label="Login" />
          <LinkItem
            to="/register"
            icon={PersonAddAltRoundedIcon}
            label="Register"
          />
        </>
      ) : (
        <>
          <LinkItem
            to={dashboardPath}
            icon={DashboardRoundedIcon}
            label="Dashboard"
          />
          <IconButton
            size="small"
            onClick={async () => {
              await logout();
              localStorage.removeItem("role");
              navigate("/login");
            }}
            sx={{ color: "#fff" }}
            aria-label="logout"
            title="Logout"
          >
            <LogoutRoundedIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}

export default Navbar;
