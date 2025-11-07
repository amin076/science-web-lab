// ✅ src/pages/dashboard/CreateClassForm.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function CreateClassForm() {
  const { user } = useAuth();
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in as a teacher.");

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "classes"), {
        teacherId: user.uid,
        teacherEmail: user.email,
        name: className,
        description,
        isPublic: true,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard/teacher");
    } catch (err) {
      console.error("❌ Error creating class:", err);
      setError("Failed to create class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 480,
          borderRadius: 3,
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🏫 Create New Class
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add a new class to start managing students and experiments.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Class Name"
            fullWidth
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            {loading ? "Creating..." : "Create Class"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
