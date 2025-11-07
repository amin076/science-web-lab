// ✅ src/components/dashboard/DrawerToggleButton.jsx
import { IconButton, Tooltip } from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function DrawerToggleButton({ open, setOpen, width }) {
  return (
    <Tooltip title={open ? "Close Dashboard" : "Open Dashboard"}>
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          position: "fixed",
          right: open ? width : 20,
          top: 120,
          zIndex: 2000,
          color: "#fff",
          background: "linear-gradient(135deg,#2563eb,#38bdf8)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          "&:hover": {
            transform: "scale(1.1)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        {open ? <CloseRoundedIcon /> : <MenuOpenIcon />}
      </IconButton>
    </Tooltip>
  );
}
