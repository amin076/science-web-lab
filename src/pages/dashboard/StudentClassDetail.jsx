// ✅ src/pages/dashboard/StudentClassDetail.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  CardMedia,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "@/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

// 🧩 Reusable layout components
import SectionPaper from "@/components/layout/SectionPaper";
import CardWrapper from "@/components/layout/CardWrapper";
import EqualHeightGrid from "@/components/layout/EqualHeightGrid";

export default function StudentClassDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const classRef = doc(db, "classes", id);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
          setAccessDenied(true);
          return;
        }

        // 🔒 Check if current student is enrolled
        const studentRef = doc(db, "classes", id, "students", user.uid);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          setAccessDenied(true);
          return;
        }

        setClassData(classSnap.data());

        // ✅ Fetch experiments
        const expsRef = collection(db, "classes", id, "experiments");
        const expsSnap = await getDocs(expsRef);

        const fetchedExperiments = expsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setExperiments(fetchedExperiments);
      } catch (err) {
        console.error("❌ Error fetching class data:", err);
        setAccessDenied(true);
      }
    };

    fetchData();
  }, [id, user]);

  // 🚫 Access Denied View
  if (accessDenied)
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          🚫 Access Denied
        </Typography>

        <Typography variant="body1">
          You are not enrolled in this class.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/dashboard/student")}
        >
          Go Back
        </Button>
      </Box>
    );

  if (!classData)
    return (
      <Typography variant="h6" sx={{ mt: 10, textAlign: "center" }}>
        Loading class details...
      </Typography>
    );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{ py: 5, px: { xs: 2, md: 4 } }}
    >
      {/* 🧪 Class Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🧪 {classData.name}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {classData.description || "No description provided."}
      </Typography>

      {/* 🧩 Experiments Section */}
      <SectionPaper>
        <Typography variant="h6" gutterBottom>
          Assigned Experiments
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {experiments.length > 0 ? (
          <EqualHeightGrid spacing={3}>
            {experiments.map((exp) => (
              <Grid item xs={12} sm={6} md={4} key={exp.id}>
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
                      <Typography variant="subtitle1" fontWeight={700}>
                        {exp.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {exp.description || "No description available."}
                      </Typography>

                      {exp.imageUrl && (
                        <CardMedia
                          component="img"
                          image={exp.imageUrl}
                          alt={exp.title}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            maxHeight: 160,
                            objectFit: "cover",
                          }}
                        />
                      )}

                      {exp.videoUrl && (
                        <Button
                          href={exp.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        >
                          🎥 Watch Video
                        </Button>
                      )}

                      {exp.audioUrl && (
                        <audio
                          controls
                          style={{ width: "100%", marginBottom: "8px" }}
                        >
                          <source src={exp.audioUrl} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      )}

                      {exp.guideText && (
                        <Typography sx={{ mt: 1 }}>
                          <strong>Guide:</strong> {exp.guideText}
                        </Typography>
                      )}

                      {exp.taskText && (
                        <Typography sx={{ mt: 0.5 }}>
                          <strong>Task:</strong> {exp.taskText}
                        </Typography>
                      )}
                    </Box>

                    {/* ✅ UPDATED BUTTONS */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* ▶️ Public Simulation */}
                      <Button
                        component={Link}
                        to={exp.path}
                        variant="contained"
                        color="success"
                        size="small"
                      >
                        Run Simulation
                      </Button>

                      {/* 📝 LMS Submission Page */}
                      <Button
                        component={Link}
                        to={`/dashboard/student/class/${id}/experiment/${exp.id}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Submit Work
                      </Button>
                    </Box>
                  </Box>
                </CardWrapper>
              </Grid>
            ))}
          </EqualHeightGrid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No experiments assigned yet.
          </Typography>
        )}
      </SectionPaper>
    </Box>
  );
}
