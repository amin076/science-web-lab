import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { motion } from "framer-motion";
import { db, storage } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddAttachmentModal({
  open,
  onClose,
  classId,
  experimentId,
  onAdded,
}) {
  const [tab, setTab] = useState(0); // 0=file, 1=text
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError("");

      let attachmentData = {};

      // 🔹 1. File Upload
      if (tab === 0) {
        if (!file && !link.trim()) {
          setError("Please select a file or enter a link.");
          setLoading(false);
          return;
        }

        if (file) {
          const fileRef = ref(
            storage,
            `attachments/${classId}/${experimentId}/${file.name}`
          );
          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on("state_changed", (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(percent);
          });

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              null,
              reject,
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                attachmentData = {
                  name: file.name,
                  url,
                  type: file.type,
                };
                resolve();
              }
            );
          });
        } else if (link.trim()) {
          attachmentData = {
            name: link,
            url: link,
            type: "link",
          };
        }
      }

      // 🔹 2. Text Note
      else if (tab === 1) {
        if (!text.trim()) {
          setError("Please write some text before saving.");
          setLoading(false);
          return;
        }

        attachmentData = {
          name: "Text Note",
          text,
          type: "text",
        };
      }

      // 🔹 Save in Firestore
      await addDoc(
        collection(
          db,
          "classes",
          classId,
          "experiments",
          experimentId,
          "attachments"
        ),
        {
          ...attachmentData,
          uploadedAt: serverTimestamp(),
        }
      );

      setFile(null);
      setLink("");
      setText("");
      setProgress(0);
      onAdded();
      onClose();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h6"
          fontWeight={700}
          component={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📎 Add Attachment or Note
        </Typography>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ px: 3 }}
      >
        <Tab label="Upload File or Link" />
        <Tab label="Write Text" />
      </Tabs>

      <DialogContent dividers>
        {tab === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a file (PDF, image, video...) or paste a link.
            </Typography>

            <Button variant="outlined" component="label" disabled={loading}>
              Select File
              <input
                hidden
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>

            {file && (
              <Typography variant="body2" color="primary">
                Selected: {file.name}
              </Typography>
            )}

            <Typography variant="body2" align="center">
              — OR —
            </Typography>

            <TextField
              label="Paste a link (optional)"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
            />

            {progress > 0 && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1 }}
              />
            )}

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Write experiment guidelines, theory, or instructions here:
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Write detailed notes or instructions..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
