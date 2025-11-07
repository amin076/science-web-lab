// ✅ src/pages/dashboard/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// 🧩 Reusable layout components
import CardWrapper from "@/components/layout/CardWrapper";
import EqualHeightGrid from "@/components/layout/EqualHeightGrid";

// 🧩 Reuse existing card UI
import ClassCard from "@/pages/dashboard/ClassCard";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 📦 Fetch teacher’s classes
  useEffect(() => {
    if (!user) return;

    const fetchClasses = async () => {
      try {
        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(fetched);
      } catch (err) {
        console.error("❌ Error fetching classes:", err);
        setError("Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const name = user?.email?.split("@")[0].replace(/\./g, " ") ?? "Teacher";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{ py: 5, px: { xs: 2, md: 4 } }}
    >
      {/* 🔹 Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            👩‍🏫 Welcome Back, {name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your classes, assign experiments, and review results.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          sx={{
            px: 3,
            py: 1,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
          onClick={() => navigate("/dashboard/create-class")}
        >
          ➕ Add Class
        </Button>
      </Box>

      {/* 🔹 Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : classes.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          You haven’t created any classes yet. Click “Add Class” to start.
        </Typography>
      ) : (
        <EqualHeightGrid spacing={{ xs: 2, sm: 3, md: 4 }}>
          {classes.map((classData) => (
            <Grid item xs={12} sm={6} md={3} key={classData.id}>
              <CardWrapper>
                <ClassCard classData={classData} role="teacher" />
              </CardWrapper>
            </Grid>
          ))}
        </EqualHeightGrid>
      )}
    </Box>
  );
}
