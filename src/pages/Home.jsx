// ✅ src/pages/Home.jsx
import { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Card,
  Avatar,
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  SchoolRounded,
  PublicRounded,
  SearchRounded,
  InsightsRounded,
  VerifiedRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  BoltRounded,
  PlayCircleFilledRounded,
  RocketLaunchRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// ✅ IMPORTANT: use the correct path where you created it
import SolarCinematicHero from "@/pages/home/SolarCinematicHero";

/* ============================= */
/* Layout Primitives             */
/* ============================= */

const Page = ({ children }) => (
  <Box
    component="main"
    sx={{
      width: "100%",
      minHeight: "100vh",
      bgcolor: "#020617",
      color: "white",
      overflowX: "hidden",
    }}
  >
    {children}
  </Box>
);

const Section = ({ children, noPadding = false }) => (
  <Box
    component="section"
    sx={{
      width: "100%",
      py: noPadding ? 0 : { xs: 8, md: 12 },
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>{children}</Box>
  </Box>
);

// Flexible Glass Card (used in other sections)
const GlassCard = ({ children, sx, hoverEffect = false }) => (
  <Card
    component={motion.div}
    whileHover={hoverEffect ? { y: -5 } : {}}
    elevation={0}
    sx={{
      borderRadius: 4,
      background: "rgba(15,23,42,0.6)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      ...sx,
    }}
  >
    {children}
  </Card>
);

export default function Home() {
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      {
        n: "01",
        title: "Pick a topic",
        desc: "Physics, Chem, or Math.",
        icon: <SearchRounded fontSize="small" />,
        color: "#38bdf8",
      },
      {
        n: "02",
        title: "Run Simulation",
        desc: "Adjust variables live.",
        icon: <InsightsRounded fontSize="small" />,
        color: "#f472b6",
      },
      {
        n: "03",
        title: "Analyze Data",
        desc: "Export graphs & results.",
        icon: <VerifiedRounded fontSize="small" />,
        color: "#34d399",
      },
    ],
    []
  );

  const audiences = useMemo(
    () => [
      {
        title: "Teachers",
        color: "#3b82f6",
        icon: <SchoolRounded fontSize="large" />,
        tag: "Classroom Mode",
        desc: "Demonstrate complex concepts safely. Assign labs and track student progress in real time.",
        points: ["No setup or cleanup", "Standardized experiments"],
      },
      {
        title: "Students",
        color: "#ec4899",
        icon: <PublicRounded fontSize="large" />,
        tag: "Self-paced Learning",
        desc: "Explore science anywhere. Visualize physics and math with instant feedback.",
        points: ["Works on any device", "Visual data export"],
      },
    ],
    []
  );

  return (
    <Page>
      {/* ================= HERO SECTION ================= */}
      <Section>
        <Stack spacing={4} alignItems="center" sx={{ textAlign: "center" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Chip
              label="New: Multiplayer Labs available v2.0"
              icon={<BoltRounded sx={{ fontSize: "16px !important" }} />}
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                backdropFilter: "blur(10px)",
                height: 32,
              }}
            />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.05,
                fontSize: { xs: "3rem", md: "5.5rem" },
                maxWidth: 900,
              }}
            >
              Master Science with <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Interactive Labs
              </span>
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography
              sx={{
                maxWidth: 600,
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
              Forget static diagrams. Build intuition by playing with variables
              in real-time physics, chemistry, and math simulations.
            </Typography>
          </motion.div>

          {/* Search & Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ width: "100%" }}
          >
            <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
              <Box sx={{ width: "100%", maxWidth: 460 }}>
                <TextField
                  fullWidth
                  placeholder="Try searching 'Gravity' or 'Optics'..."
                  onFocus={() => navigate("/experiments")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      bgcolor: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "white",
                      paddingRight: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <Button
                        variant="contained"
                        onClick={() => navigate("/experiments")}
                        sx={{
                          minWidth: 40,
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          p: 0,
                        }}
                      >
                        <ArrowForwardRounded fontSize="small" />
                      </Button>
                    ),
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<PlayCircleFilledRounded />}
                  sx={{
                    color: "#fff",
                    opacity: 0.8,
                    "&:hover": { opacity: 1 },
                  }}
                  onClick={() => navigate("/about")}
                >
                  Watch Demo
                </Button>
                <Button
                  startIcon={<RocketLaunchRounded />}
                  sx={{
                    color: "#fff",
                    opacity: 0.8,
                    "&:hover": { opacity: 1 },
                  }}
                  onClick={() => navigate("/experiments")}
                >
                  All Experiments
                </Button>
              </Stack>
            </Stack>
          </motion.div>

          {/* ================= HERO DEMO (NO BLUR WRAPPER) ================= */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ width: "100%", marginTop: "60px" }}
          >
            <Box
              sx={{
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                background: "rgba(2,6,23,0.35)", // ✅ no backdrop blur here
              }}
            >
              <SolarCinematicHero />
            </Box>
          </motion.div>
        </Stack>
      </Section>

      {/* ================= WORKFLOW ================= */}
      <Section>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: "#38bdf8", letterSpacing: 1.5, fontWeight: 700 }}
          >
            Workflow
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
            Three steps to learning
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {steps.map((s, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <GlassCard
                hoverEffect
                sx={{
                  p: 4,
                  height: "100%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: alpha(s.color, 0.1),
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    border: `1px solid ${alpha(s.color, 0.2)}`,
                  }}
                >
                  {s.icon}
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.desc}
                </Typography>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ================= AUDIENCE ================= */}
      <Section>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontWeight: 800, mb: 6 }}
        >
          Who is this for?
        </Typography>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {audiences.map((a) => (
            <Grid key={a.title} item xs={12} md={6}>
              <GlassCard
                hoverEffect
                sx={{
                  p: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha(a.color, 0.2),
                    color: a.color,
                    mb: 2,
                  }}
                >
                  {a.icon}
                </Avatar>

                <Typography variant="h5" fontWeight={800}>
                  {a.title}
                </Typography>

                <Chip
                  label={a.tag}
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 3,
                    bgcolor: alpha(a.color, 0.2),
                    color: a.color,
                  }}
                />

                <Typography
                  sx={{ maxWidth: 420, color: "rgba(255,255,255,0.7)", mb: 4 }}
                >
                  {a.desc}
                </Typography>

                <Box
                  sx={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: 1.5,
                    textAlign: "left",
                  }}
                >
                  {a.points.map((p) => (
                    <Stack
                      key={p}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <CheckCircleRounded
                        sx={{ color: a.color, fontSize: 20 }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {p}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ================= CTA ================= */}
      <Section>
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(56,189,248,0.15), rgba(0,0,0,0))",
            border: "1px solid rgba(56,189,248,0.25)",
          }}
        >
          <Typography variant="h4" fontWeight={800} mb={2}>
            Ready to start experimenting?
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Join the lab today. It's free for individual students.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              borderRadius: 999,
              px: 6,
              py: 1.8,
              background: "white",
              color: "black",
              fontWeight: 700,
              fontSize: "1.1rem",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            Create Account
          </Button>
        </Box>
      </Section>
    </Page>
  );
}
