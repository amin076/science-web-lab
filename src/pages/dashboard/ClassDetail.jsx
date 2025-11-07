import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddExperimentModal from "./AddExperimentModal";

export default function ClassDetail() {
  const { id } = useParams(); // id کلاس از URL
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [addOpen, setAddOpen] = useState(false);

  // 📥 گرفتن اطلاعات از Firestore
  const fetchData = async () => {
    try {
      const classRef = doc(db, "classes", id);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) setClassData(classSnap.data());

      const studentsRef = collection(db, "classes", id, "students");
      const studentsSnap = await getDocs(studentsRef);
      setStudents(studentsSnap.docs.map((d) => d.data()));

      const expsRef = collection(db, "classes", id, "experiments");
      const expsSnap = await getDocs(expsRef);
      setExperiments(expsSnap.docs.map((d) => d.data()));
    } catch (err) {
      console.error("❌ Error fetching class data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
      sx={{ py: 5 }}
    >
      {/* 🧑‍🏫 Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🧑‍🏫 {classData.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {classData.description || "No description provided."}
      </Typography>

      {/* ⚙️ Content */}
      <Grid container spacing={4}>
        {/* 👨‍🎓 Students Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              👩‍🎓 Students
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {students.length > 0 ? (
                students.map((s, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={s.name || s.email} />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No students yet.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* 🧪 Experiments Section */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">🧪 Experiments</Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAddOpen(true)}
              >
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 2, mt: 1 }} />
            <List dense>
              {experiments.length > 0 ? (
                experiments.map((e, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={e.title}
                      secondary={e.description || "No description"}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No experiments added yet.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 🧩 Add Experiment Modal */}
      <AddExperimentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        classId={id}
        onAdded={fetchData} // Refresh list after adding
      />
    </Box>
  );
}
