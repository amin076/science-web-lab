// ✅ src/pages/dashboard/PendingRequests.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {resolveLegacyJoinRequest} from "@/services/classMembership";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Button,
  Alert,
} from "@mui/material";

export default function PendingRequests() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 📦 دریافت کلاس‌هایی که توسط معلم ساخته شده
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(fetched);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchClasses();
  }, [user]);

  // 🧾 تأیید دانش‌آموز
  const handleAccept = async (classId, studentUid) => {
    try {
      await resolveLegacyJoinRequest(classId,studentUid,true);
      setClasses(previous=>previous.map(c=>c.id===classId?{...c,pendingStudents:c.pendingStudents.filter(uid=>uid!==studentUid)}:c));
      setMessage("✅ Student approved successfully!");
    } catch (err) {
      console.error("Error approving student:", err);
      setMessage("❌ Failed to approve student.");
    }
  };

  // ❌ رد درخواست
  const handleReject = async (classId, studentUid) => {
    try {
      await resolveLegacyJoinRequest(classId,studentUid,false);
      setClasses(previous=>previous.map(c=>c.id===classId?{...c,pendingStudents:c.pendingStudents.filter(uid=>uid!==studentUid)}:c));
      setMessage("⚠️ Student request rejected.");
    } catch (err) {
      console.error("Error rejecting student:", err);
      setMessage("❌ Failed to reject student.");
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading pending requests...
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        📬 Pending Join Requests
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review and manage student requests for your classes.
      </Typography>

      {message && (
        <Alert
          severity={
            message.startsWith("✅")
              ? "success"
              : message.startsWith("⚠️")
              ? "warning"
              : "error"
          }
          sx={{ mb: 3 }}
        >
          {message}
        </Alert>
      )}

      {classes.length === 0 ? (
        <Typography>No classes found.</Typography>
      ) : (
        classes.map((cls) => (
          <Paper
            key={cls.id}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {cls.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pending Requests: {cls.pendingStudents?.length || 0}
            </Typography>

            <Grid container spacing={2}>
              {cls.pendingStudents?.length ? (
                cls.pendingStudents.map((studentUid) => (
                  <Grid item xs={12} md={6} key={studentUid}>
                    <StudentCard
                      studentUid={studentUid}
                      classId={cls.id}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  </Grid>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  No pending requests for this class.
                </Typography>
              )}
            </Grid>
          </Paper>
        ))
      )}
    </Box>
  );
}

// 🔹 زیرکامپوننت برای نمایش اطلاعات دانش‌آموز
function StudentCard({ studentUid, classId, onAccept, onReject }) {
  return <Paper sx={{p:2}}>
    <Typography sx={{overflowWrap:"anywhere"}}>Student: {studentUid}</Typography>
    <Box sx={{display:"flex",gap:2,mt:2}}>
      <Button onClick={()=>onAccept(classId,studentUid)}>Accept</Button>
      <Button color="error" onClick={()=>onReject(classId,studentUid)}>Reject</Button>
    </Box>
  </Paper>;
}
