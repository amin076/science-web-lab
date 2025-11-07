// ✅ src/components/dashboard/DrawerHeader.jsx
import { Box, Typography } from "@mui/material";

export default function DrawerHeader({ role, name }) {
  return (
    <Box
      sx={{
        p: 3,
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {role === "teacher" ? "👩‍🏫 Teacher Panel" : "👩‍🎓 Student Panel"}
      </Typography>
      <Typography
        variant="body2"
        color="rgba(255,255,255,0.85)"
        sx={{ mt: 1 }}
      >
        Hello, {name}
      </Typography>
    </Box>
  );
}
