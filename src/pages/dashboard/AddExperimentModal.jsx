import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { experimentsData } from "@/data/experiments";

export default function AddExperimentModal({ open, onClose, classId, onAdded }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedExp, setSelectedExp] = useState(null);

  // 🧩 Extra fields for classroom-specific experiments
  const [guide, setGuide] = useState("");
  const [task, setTask] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const handleAddFromLibrary = async () => {
    if (!selectedExp) return alert("Please select an experiment first!");
    setLoading(true);
    setError("");

    try {
      const expId =
        selectedExp.id ||
        selectedExp.name?.toLowerCase().replace(/\s+/g, "-") ||
        "experiment";

      await addDoc(collection(db, "classes", classId, "experiments"), {
        title: selectedExp.name,
        description: selectedExp.desc,
        subject: selectedExp.subject,
        path: `/experiments/${expId}`,
        guideText: guide,
        taskText: task,
        videoUrl,
        imageUrl,
        audioUrl,
        createdAt: serverTimestamp(),
      });

      onAdded();
      onClose();
      setSelectedExp(null);
      setGuide("");
      setTask("");
      setVideoUrl("");
      setImageUrl("");
      setAudioUrl("");
    } catch (err) {
      console.error(err);
      setError("Failed to add experiment from library");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h6"
          fontWeight={700}
          component={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🧪 Add Experiment to Class
        </Typography>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ px: 3 }}
      >
        <Tab label="From Library" />
      </Tabs>

      <DialogContent dividers>
        {/* 🔹 Select Experiment */}
        {tab === 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {experimentsData.map((exp) => (
                <Grid item xs={12} sm={6} md={4} key={exp.id}>
                  <Paper
                    onClick={() => setSelectedExp(exp)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderRadius: 2,
                      border:
                        selectedExp?.id === exp.id
                          ? "2px solid #3b82f6"
                          : "1px solid transparent",
                      background:
                        selectedExp?.id === exp.id
                          ? "rgba(59,130,246,0.1)"
                          : "background.paper",
                      transition: "0.3s",
                    }}
                    component={motion.div}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <exp.Icon sx={{ fontSize: 40, mb: 1, color: "#3b82f6" }} />
                      <Typography variant="subtitle1" fontWeight={700}>
                        {exp.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {exp.subject}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* 🔹 Additional materials for selected experiment */}
            {selectedExp && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📘 Additional Materials
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Guide / Instructions"
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Task / Assignment"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Video URL (optional)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Audio URL (optional)"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  sx={{ mb: 1 }}
                />

                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleAddFromLibrary}
          variant="contained"
          disabled={loading || !selectedExp}
          color="primary"
        >
          {loading ? "Adding..." : "Add to Class"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
