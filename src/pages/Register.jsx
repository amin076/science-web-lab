import { Box, Card, CardContent, Typography } from "@mui/material";

export default function Register() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center">Register Page</Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            (Form will be added later)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
