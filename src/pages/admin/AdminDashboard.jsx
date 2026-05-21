import { Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { listUsersFunction } from "../../services/adminService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

function StatCard({ title, value }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    contactMessages: 0,
    resolvedMessages: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const usersResult = await listUsersFunction();
      const users = usersResult.data.users || [];

      const messagesSnapshot = await getDocs(collection(db, "contactMessages"));
      const messages = messagesSnapshot.docs.map((doc) => doc.data());

      setStats({
        totalUsers: users.length,
        students: users.filter((u) => u.role === "student").length,
        teachers: users.filter((u) => u.role === "teacher").length,
        admins: users.filter((u) => u.role === "admin").length,
        contactMessages: messages.length,
        resolvedMessages: messages.filter((m) => m.status === "resolved").length,
      });
    };

    loadStats();
  }, []);

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard title="Total Users" value={stats.totalUsers} />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard title="Students" value={stats.students} />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard title="Teachers" value={stats.teachers} />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard title="Admins" value={stats.admins} />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard title="Contact Messages" value={stats.contactMessages} />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard title="Resolved Messages" value={stats.resolvedMessages} />
        </Grid>
      </Grid>
    </AdminLayout>
  );
}