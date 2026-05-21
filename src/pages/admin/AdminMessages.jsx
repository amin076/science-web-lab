import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
} from "@mui/material";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import { db } from "../../firebaseConfig";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "contactMessages")
      );

      console.log("Messages snapshot:", snapshot.size);

      const items = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      const sortedItems = items.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      console.log("Messages items:", sortedItems);

      setMessages(sortedItems);
    } catch (error) {
      console.error("Load contact messages error:", error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markResolved = async (id) => {
    try {
      await updateDoc(doc(db, "contactMessages", id), {
        status: "resolved",
      });

      await loadMessages();
    } catch (error) {
      console.error("Resolve message error:", error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, "contactMessages", id));
      await loadMessages();
    } catch (error) {
      console.error("Delete message error:", error);
    }
  };

  return (
    <AdminLayout>
    <Box >
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Contact Messages
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Organisation</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>{message.name || "-"}</TableCell>
                <TableCell>{message.email || "-"}</TableCell>
                <TableCell>{message.organisation || "-"}</TableCell>
                <TableCell>{message.reason || "-"}</TableCell>

                <TableCell
                  sx={{
                    maxWidth: 420,
                    whiteSpace: "normal",
                  }}
                >
                  {message.message || "-"}
                </TableCell>

                <TableCell>
                  {message.status === "resolved" ? (
                    <Chip label="Resolved" color="success" />
                  ) : (
                    <Chip label={message.status || "New"} color="warning" />
                  )}
                </TableCell>

                <TableCell>
                  {message.status !== "resolved" && (
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() => markResolved(message.id)}
                    >
                      Resolve
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteMessage(message.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
    </AdminLayout>
  );
}
