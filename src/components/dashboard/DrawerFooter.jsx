// ✅ src/components/dashboard/DrawerFooter.jsx
import { Divider, ListItemButton, ListItemText, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DrawerFooter({ logout }) {
  return (
    <>
      <Divider sx={{ opacity: 0.3 }} />
      <ListItemButton
        onClick={logout}
        sx={{
          color: "inherit",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </>
  );
}
