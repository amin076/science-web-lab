// ✅ src/pages/dashboard/JoinClass.jsx
import { useEffect, useState } from "react";
import {listStudentClasses,joinPublicClass} from "@/services/classMembership";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";

export default function JoinClass() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 📦 دریافت لیست کلاس‌ها
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if(!user)return;
        const result = await listStudentClasses(user.uid);
        setClasses(result.available);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setMessage("Unable to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  // ✉️ ارسال درخواست عضویت
  const handleJoinRequest = async (classId) => {
    try {
      if(!user)throw new Error('Please sign in first.');
      await joinPublicClass(classId,user);
      setClasses(previous=>previous.filter(c=>c.id!==classId));
      setMessage("✅ Joined successfully!");
    } catch (err) {
      console.error("Error sending join request:", err);
      setMessage("❌ Failed to join class. Please try again.");
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading available classes...
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🧑‍🏫 Join a Class
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse public classes and join to access their learning activities.
      </Typography>

      {message && (
        <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {classes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No classes found.
          </Typography>
        ) : (
          classes.map((cls) => (
            <Grid item xs={12} md={4} key={cls.id}>
              <Paper
                elevation={5}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {cls.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {cls.description || "No description provided."}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    Teacher: {cls.teacherName || "Unknown"}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={() => handleJoinRequest(cls.id)}
                >
                  Join Class
                </Button>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
