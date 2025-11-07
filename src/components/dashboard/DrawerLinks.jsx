// ✅ src/components/dashboard/DrawerLinks.jsx
import { List, ListItemButton, ListItemText, ListItemIcon } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import ClassIcon from "@mui/icons-material/Class";
import { NavLink } from "react-router-dom";

export default function DrawerLinks({ role, isMobile, setOpen }) {
  const links =
    role === "teacher"
      ? [
          { icon: <DashboardIcon />, text: "Dashboard", to: "/dashboard/teacher" },
          { icon: <ClassIcon />, text: "My Classes", to: "#" },
          { icon: <ScienceIcon />, text: "Assign Experiments", to: "#" },
        ]
      : [
          { icon: <DashboardIcon />, text: "Dashboard", to: "/dashboard/student" },
          { icon: <ScienceIcon />, text: "My Experiments", to: "#" },
          { icon: <ClassIcon />, text: "My Classes", to: "#" },
        ];

  return (
    <List sx={{ flex: 1 }}>
      {links.map((item) => (
        <ListItemButton
          key={item.text}
          component={NavLink}
          to={item.to}
          onClick={() => isMobile && setOpen(false)}
          sx={{
            color: "inherit",
            "&.active": {
              backgroundColor: "rgba(255,255,255,0.18)",
              fontWeight: 700,
            },
            "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  );
}
