// ✅ src/pages/dashboard/StudentExperiment.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "@/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/useAuth";

export default function StudentExperiment() {
  const { classId, expId } = useParams();
  const { user } = useAuth();

  const [experiment, setExperiment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 دریافت اطلاعات آزمایش
  useEffect(() => {
    const fetchExperiment = async () => {
      const expRef = doc(db, "classes", classId, "experiments", expId);
      const expSnap = await getDoc(expRef);
      if (expSnap.exists()) setExperiment(expSnap.data());

      // 🔹 دریافت ارسال‌های دانش‌آموز فعلی
      const subsRef = collection(
        db,
        "classes",
        classId,
        "experiments",
        expId,
        "submissions"
      );
      const subsSnap = await getDocs(subsRef);
      const data = subsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.uid === user.uid);
      setSubmissions(data);
      setLoading(false);
    };
    fetchExperiment();
  }, [classId, expId, user.uid]);

  const handleFileUpload = async () => {
    if (!file) return alert("Please choose a file first!");
    try {
      const fileRef = ref(
        storage,
        `submissions/${classId}/${expId}/${user.uid}/${file.name}`
      );
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(
        collection(db, "classes", classId, "experiments", expId, "submissions"),
        {
          uid: user.uid,
          email: user.email,
          fileName: file.name,
          fileURL: url,
          createdAt: serverTimestamp(),
        }
      );

      alert("✅ File submitted successfully!");
      setFile(null);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed. Please try again.");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!experiment)
    return <Typography sx={{ mt: 10, textAlign: "center" }}>Experiment not found.</Typography>;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ py: 5 }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🧪 {experiment.title}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {experiment.description || "No description provided."}
      </Typography>

      {/* 🔹 Resources */}
      {experiment.resources && experiment.resources.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📁 Resources
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List dense>
            {experiment.resources.map((r, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={<a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* 🔹 Upload Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📤 Submit Your Work
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "10px" }}
        />
        <Button variant="contained" onClick={handleFileUpload}>
          Upload
        </Button>
      </Paper>

      {/* 🔹 Past Submissions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗂 Your Submissions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {submissions.length > 0 ? (
          <List dense>
            {submissions.map((s) => (
              <ListItem key={s.id}>
                <ListItemText
                  primary={s.fileName}
                  secondary={
                    <a href={s.fileURL} target="_blank" rel="noreferrer">
                      View File
                    </a>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No submissions yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
