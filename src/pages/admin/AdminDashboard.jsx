import { Box, Paper, Typography } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#020617",
        color: "white",
        p: 4,
      }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 900,
          mx: "auto",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Esbiko Admin Panel
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Admin access is working successfully.
        </Typography>

        <Typography sx={{ mt: 4 }}>
          Next steps:
        </Typography>

        <ul>
          <li>User management</li>
          <li>Role management</li>
          <li>Contact messages</li>
          <li>Classes and enrollments</li>
          <li>Simulation analytics</li>
        </ul>
      </Paper>
    </Box>
  );
}
