// ✅ src/pages/dashboard/TeacherClassDetail.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "@/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import AddExperimentModal from "./AddExperimentModal";
import AddAttachmentModal from "@/pages/dashboard/AddAttachmentModal";

// 🧩 Reusable layout components
import SectionPaper from "@/components/layout/SectionPaper";
import CardWrapper from "@/components/layout/CardWrapper";
import EqualHeightGrid from "@/components/layout/EqualHeightGrid";

export default function TeacherClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchData = async () => {
    try {
      const classRef = doc(db, "classes", id);
      const classSnap = await getDoc(classRef);

      if (!classSnap.exists()) {
        setAccessDenied(true);
        return;
      }

      const data = classSnap.data();
      if (user?.uid !== data.teacherId) {
        setAccessDenied(true);
        return;
      }

      setClassData(data);

      // 🧑‍🎓 Students
      const studentsRef = collection(db, "classes", id, "students");
      const studentsSnap = await getDocs(studentsRef);
      setStudents(studentsSnap.docs.map((d) => d.data()));

      // 🧪 Experiments
      const expsRef = collection(db, "classes", id, "experiments");
      const expsSnap = await getDocs(expsRef);

      const fetchedExperiments = await Promise.all(
        expsSnap.docs.map(async (expDoc) => {
          const expData = expDoc.data();

          // 📎 Attachments
          const attachmentsRef = collection(
            db,
            "classes",
            id,
            "experiments",
            expDoc.id,
            "attachments"
          );
          const attSnap = await getDocs(attachmentsRef);
          const attachments = attSnap.docs.map((a) => ({
            id: a.id,
            ...a.data(),
          }));

          return {
            id: expDoc.id,
            ...expData,
            path: expData.path || `/experiments/${expDoc.id}`,
            attachments,
          };
        })
      );

      setExperiments(fetchedExperiments);
    } catch (err) {
      console.error("❌ Error loading class data:", err);
      setAccessDenied(true);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [id, user]);

  // 🚫 Access denied view
  if (accessDenied)
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          🚫 Access Denied
        </Typography>
        <Typography variant="body1">
          You are not authorized to view this class.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/dashboard/teacher")}
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
      {/* 🏫 Class Info */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🏫 {classData.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {classData.description || "No description provided."}
      </Typography>

      {/* 👩‍🎓 Students Section */}
      <SectionPaper>
        <Typography variant="h6" gutterBottom>
          👨‍🎓 Students
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {students.length > 0 ? (
          <EqualHeightGrid spacing={3}>
            {students.map((s, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <CardWrapper>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {s.name || "Unnamed Student"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {s.email || "No email available"}
                    </Typography>
                  </Box>
                </CardWrapper>
              </Grid>
            ))}
          </EqualHeightGrid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No students joined yet.
          </Typography>
        )}
      </SectionPaper>

      {/* 🧪 Experiments Section */}
      <SectionPaper sx={{ mt: 5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">🧪 Experiments</Typography>
          <Button variant="outlined" color="primary" onClick={() => setAddOpen(true)}>
            Add Experiment
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {experiments.length > 0 ? (
          <EqualHeightGrid spacing={3}>
            {experiments.map((exp) => (
              <Grid item xs={12} sm={6} md={4} key={exp.id}>
                <CardWrapper>
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {exp.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {exp.description || "No description provided."}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                      <Button
                        component={Link}
                        to={exp.path}
                        variant="contained"
                        color="success"
                        size="small"
                      >
                        Run
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedExp(exp);
                          setAttachOpen(true);
                        }}
                      >
                        + Add File
                      </Button>
                    </Box>

                    {exp.attachments && exp.attachments.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          Attachments:
                        </Typography>
                        {exp.attachments.map((file, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            component="a"
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: "block",
                              textDecoration: "underline",
                              color: "primary.main",
                              ml: 1,
                            }}
                          >
                            📄 {file.name || `Attachment ${i + 1}`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </CardWrapper>
              </Grid>
            ))}
          </EqualHeightGrid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No experiments added yet.
          </Typography>
        )}
      </SectionPaper>

      {/* 🧩 Modals */}
      <AddExperimentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        classId={id}
        onAdded={fetchData}
      />

      {selectedExp && (
        <AddAttachmentModal
          open={attachOpen}
          onClose={() => setAttachOpen(false)}
          classId={id}
          experimentId={selectedExp.id}
          onAdded={fetchData}
        />
      )}
    </Box>
  );
}
