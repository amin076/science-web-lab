// src/pages/Contact.jsx

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const reasons = [
  "Teacher enquiry",
  "School partnership",
  "University collaboration",
  "Company partnership",
  "Personal enquiry",
  "Feedback",
  "Bug report",
  "Simulation request",
  "Other",
];

const contactCards = [
  { title: "Teacher enquiries", icon: SchoolRoundedIcon },
  { title: "School partnerships", icon: HandshakeRoundedIcon },
  { title: "University collaborations", icon: SchoolRoundedIcon },
  { title: "Company partnerships", icon: BusinessRoundedIcon },
  { title: "Personal enquiries", icon: PersonRoundedIcon },
  { title: "Feedback & bug reports", icon: BugReportRoundedIcon },
];

export default function Contact() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    reason: "Teacher enquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const cardBg = isDark ? alpha("#334155", 0.72) : alpha("#ffffff", 0.82);
  const borderColor = isDark ? alpha("#ffffff", 0.1) : alpha("#0f172a", 0.1);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await addDoc(collection(db, "contactMessages"), {
        ...form,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setForm({
        name: "",
        email: "",
        organisation: "",
        reason: "Teacher enquiry",
        message: "",
      });

      setStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      setStatus({
        type: "error",
        message: "Sorry, something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 5, md: 8 },
        px: { xs: 2.5, sm: 4, md: 6 },
      }}
    >
      <Stack spacing={2} textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight={900}>
          Contact Esbiko
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 760,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Have a question, feedback, partnership idea, or school enquiry? We
          would love to hear from you.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.55fr) minmax(380px, 0.75fr)",
          },
          gap: 4,
          alignItems: "start",
        }}
      >
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 4,
              background: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark
                ? "0 20px 45px rgba(0,0,0,0.25)"
                : "0 20px 45px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Typography variant="h4" fontWeight={900}>
                  Get in touch
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailRoundedIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    esbiko.science@gmail.com
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocationOnRoundedIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Australia & Canada
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {contactCards.map(({ title, icon: Icon }) => (
              <Card
                key={title}
                sx={{
                  borderRadius: 3,
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isDark
                      ? "0 14px 30px rgba(0,0,0,0.2)"
                      : "0 14px 30px rgba(15,23,42,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Icon color="primary" />
                    <Typography fontWeight={800}>{title}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>

        <Card
          sx={{
            borderRadius: 4,
            background: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? "0 20px 45px rgba(0,0,0,0.25)"
              : "0 20px 45px rgba(15,23,42,0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Typography variant="h4" fontWeight={900}>
                  Send us a message
                </Typography>

                {status.message && (
                  <Alert severity={status.type}>{status.message}</Alert>
                )}

                <TextField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Organisation / School"
                  name="organisation"
                  value={form.organisation}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  select
                  label="Reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  fullWidth
                >
                  {reasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  minRows={5}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 900,
                    textTransform: "none",
                  }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}