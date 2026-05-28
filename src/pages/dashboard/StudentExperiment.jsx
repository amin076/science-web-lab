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
  Alert,
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
  query,
  where,
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
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchExperiment = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");
      console.log("classId:", classId);
      console.log("expId:", expId);

      const expRef = doc(db, "classes", classId, "experiments", expId);
      const expSnap = await getDoc(expRef);
      console.log("Experiment exists:", expSnap.exists());
      if (expSnap.exists()) {
        setExperiment({ id: expSnap.id, ...expSnap.data() });
      }

      const subsRef = collection(
        db,
        "classes",
        classId,
        "experiments",
        expId,
        "submissions",
      );

      const mySubsQuery = query(subsRef, where("uid", "==", user.uid));
      const subsSnap = await getDocs(mySubsQuery);

      const data = subsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setSubmissions(data);
    } catch (err) {
      console.error("❌ Error loading experiment:", err);
      setError("Failed to load experiment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, expId, user]);

  const handleSubmission = async () => {
    if (!user) {
      setError("Please login first.");
      return;
    }

    if (!answer.trim() && !file) {
      setError("Please write an answer or choose a file before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let fileURL = "";
      let fileName = "";

      if (file) {
        const fileRef = ref(
          storage,
          `submissions/${classId}/${expId}/${user.uid}/${Date.now()}-${file.name}`,
        );

        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
        fileName = file.name;
      }

      await addDoc(
        collection(db, "classes", classId, "experiments", expId, "submissions"),
        {
          uid: user.uid,
          email: user.email || "",
          answerText: answer.trim(),
          fileName,
          fileURL,
          status: "submitted",
          submittedAt: serverTimestamp(),
        },
      );

      setAnswer("");
      setFile(null);
      await fetchExperiment();
    } catch (err) {
      console.error("❌ Submission failed:", err);
      setError(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!experiment) {
    return (
      <Typography sx={{ mt: 10, textAlign: "center" }}>
        Experiment not found.
      </Typography>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ py: 5, px: { xs: 2, md: 4 } }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🧪 {experiment.title}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {experiment.description || "No description provided."}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {experiment.guideText && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📘 Guide / Instructions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{experiment.guideText}</Typography>
        </Paper>
      )}

      {experiment.taskText && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📝 Task / Assignment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{experiment.taskText}</Typography>
        </Paper>
      )}

      {experiment.videoUrl && (
        <Button
          href={experiment.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          sx={{ mr: 1, mb: 3 }}
        >
          🎥 Watch Video
        </Button>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📤 Submit Your Work
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Answer / Report"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          sx={{ mb: 2 }}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: "10px" }}
        />

        {file && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selected file: {file.name}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleSubmission}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🗂 Your Submissions
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {submissions.length > 0 ? (
          <List dense>
            {submissions.map((s) => (
              <ListItem key={s.id} alignItems="flex-start">
                <ListItemText
                  primary={s.fileName || "Text submission"}
                  secondary={
                    <Box component="span" sx={{ display: "block" }}>
                      {s.answerText && (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Answer: {s.answerText}
                        </Typography>
                      )}

                      {s.fileURL && (
                        <a href={s.fileURL} target="_blank" rel="noreferrer">
                          View File
                        </a>
                      )}

                      <Typography
                        component="span"
                        variant="caption"
                        color="success.main"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        Status: {s.status || "submitted"}
                      </Typography>
                    </Box>
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
