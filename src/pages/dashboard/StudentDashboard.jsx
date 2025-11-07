// ✅ src/pages/dashboard/StudentDashboard.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// 🧩 Reusable layout components
import EqualHeightGrid from "@/components/layout/EqualHeightGrid";
import CardWrapper from "@/components/layout/CardWrapper";
import SectionPaper from "@/components/layout/SectionPaper";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [joined, setJoined] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // 📦 Load all classes
  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);
    setErr("");
    try {
      const allSnap = await getDocs(collection(db, "classes"));
      const all = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ✅ Check which classes the student is in
      const results = await Promise.all(
        all.map(async (cls) => {
          const myRef = doc(db, "classes", cls.id, "students", user.uid);
          const mySnap = await getDoc(myRef);
          return { cls, isMember: mySnap.exists() };
        })
      );

      const joinedClasses = results.filter((r) => r.isMember).map((r) => r.cls);
      const availableClasses = results
        .filter((r) => !r.isMember)
        .map((r) => r.cls);

      setJoined(joinedClasses);
      setAvailable(availableClasses);
    } catch (e) {
      console.error("❌ loadClasses error:", e);
      setErr("Failed to load classes.");
      setJoined([]);
      setAvailable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 🧩 Join a class
  const handleJoin = async (classId) => {
    try {
      if (!user) return alert("Please login first.");
      const studentRef = doc(db, "classes", classId, "students", user.uid);
      const existing = await getDoc(studentRef);
      if (existing.exists()) {
        alert("You are already in this class.");
        return;
      }
      await setDoc(studentRef, {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date(),
      });
      alert("✅ Joined successfully!");
      await loadClasses(); // refresh
    } catch (e) {
      console.error("❌ join error:", e);
      alert(`Join failed: ${e.message}`);
    }
  };

  const Name = user?.email?.split("@")[0] ?? "Student";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{ py: 5, px: { xs: 2, md: 4 } }}
    >
      <Typography variant="h4" fontWeight={800} gutterBottom>
        👨‍🎓 Welcome Back, {Name}!
      </Typography>

      {loading ? (
        <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : err ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {err}
        </Alert>
      ) : (
        <>
          {/* 🎓 Joined Classes */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            🎓 Your Joined Classes
          </Typography>
          <SectionPaper>
            {joined.length === 0 ? (
              <Typography color="text.secondary">
                You haven’t joined any classes yet.
              </Typography>
            ) : (
              <EqualHeightGrid spacing={3}>
                {joined.map((cls) => (
                  <Grid item xs={12} sm={6} md={4} key={cls.id}>
                    <CardWrapper>
                      <Box
                        sx={{
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {cls.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {cls.description || "No description"}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            navigate(`/dashboard/student/class/${cls.id}`)
                          }
                        >
                          Open
                        </Button>
                      </Box>
                    </CardWrapper>
                  </Grid>
                ))}
              </EqualHeightGrid>
            )}
          </SectionPaper>

          {/* 🧭 Available Classes */}
          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
            🧭 Available Classes
          </Typography>
          <SectionPaper>
            {available.length === 0 ? (
              <Typography color="text.secondary">
                No available classes found.
              </Typography>
            ) : (
              <EqualHeightGrid spacing={3}>
                {available.map((cls) => (
                  <Grid item xs={12} sm={6} md={4} key={cls.id}>
                    <CardWrapper>
                      <Box
                        sx={{
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {cls.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {cls.description || "No description"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 1 }}
                          >
                            Teacher: {cls.teacherName || "Unknown"}
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleJoin(cls.id)}
                          >
                            Join
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/experiments`)}
                          >
                            Explore Experiments
                          </Button>
                        </Box>
                      </Box>
                    </CardWrapper>
                  </Grid>
                ))}
              </EqualHeightGrid>
            )}
          </SectionPaper>
        </>
      )}
    </Box>
  );
}
