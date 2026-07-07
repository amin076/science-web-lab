// ✅ src/pages/Home.jsx
import { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
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
  RocketLaunchRounded,
  ScienceRounded,
  AutoStoriesRounded,
  ExploreRounded,
  WorkspacePremiumRounded,
  DescriptionRounded,
  AssignmentRounded,
  ShowChartRounded,
  PsychologyRounded,
  DevicesRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { ResponsiveContainer } from "@/components/mobile";
import SolarCinematicHero from "@/pages/home/SolarCinematicHero";

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

const Section = ({ children, compact = false }) => (
  <Box
    component="section"
    sx={{
      width: "100%",
      py: compact ? { xs: 5, md: 7 } : { xs: 7, md: 10 },
    }}
  >
    <ResponsiveContainer maxWidth={1200} sx={{ px: { xs: 2.5, md: 3 } }}>
      {children}
    </ResponsiveContainer>
  </Box>
);

const CardGrid = ({ children, columns = 3, sx }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        md: `repeat(${columns}, minmax(0, 1fr))`,
      },
      gap: 4,
      ...sx,
    }}
  >
    {children}
  </Box>
);

const GlassCard = ({ children, sx, hoverEffect = true }) => (
  <Card
    component={motion.div}
    whileHover={hoverEffect ? { y: -5 } : {}}
    elevation={0}
    sx={{
      borderRadius: 4,
      background: "rgba(15,23,42,0.66)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
      transition: "all 0.3s ease",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

export default function Home() {
  const navigate = useNavigate();

  const featuredLabs = useMemo(
    () => [
      {
        title: "Projectile Motion",
        desc: "Investigate velocity, gravity, trajectories, vectors, motion trails, and real-time data graphs.",
        tag: "Classroom Ready",
        icon: <RocketLaunchRounded />,
        color: "#38bdf8",
        href: "/experiments/physics.mechanics.projectile",
      },
      {
        title: "Optics Bench",
        desc: "Explore lenses, mirrors, light rays, image formation, and ray behaviour through visual experiments.",
        tag: "Physics Lab",
        icon: <ScienceRounded />,
        color: "#a78bfa",
        href: "/experiments",
      },
      {
        title: "Solar System",
        desc: "Visualise planets, moons, orbital motion, space scale, and astronomy concepts.",
        tag: "Space Demo",
        icon: <PublicRounded />,
        color: "#f59e0b",
        href: "/experiments",
      },
    ],
    [],
  );

  const whyEsbiko = useMemo(
    () => [
      {
        title: "Learn by experimenting",
        desc: "Students can change variables, observe outcomes, and build intuition instead of only memorising formulas.",
        icon: <PsychologyRounded />,
        color: "#38bdf8",
      },
      {
        title: "Classroom-ready direction",
        desc: "Esbiko is being shaped around teacher guides, worksheets, guided investigations, and classroom activities.",
        icon: <SchoolRounded />,
        color: "#818cf8",
      },
      {
        title: "Science for everyone",
        desc: "Teachers and students are central, but Esbiko is also open to curious minds who simply enjoy science.",
        icon: <ExploreRounded />,
        color: "#22c55e",
      },
    ],
    [],
  );

  const resources = useMemo(
    () => [
      {
        title: "Teacher Guides",
        desc: "Support classroom demonstrations with lesson flow, teaching notes, misconceptions, and discussion prompts.",
        icon: <DescriptionRounded />,
        color: "#60a5fa",
      },
      {
        title: "Student Worksheets",
        desc: "Printable activities with predictions, variables, observations, data tables, and reflection questions.",
        icon: <AssignmentRounded />,
        color: "#f472b6",
      },
      {
        title: "Graphs and Data",
        desc: "Help learners connect visual motion with position, velocity, energy, and scientific reasoning.",
        icon: <ShowChartRounded />,
        color: "#34d399",
      },
    ],
    [],
  );

  const steps = useMemo(
    () => [
      {
        n: "01",
        title: "Choose a simulation",
        desc: "Start with motion, optics, space, waves, electricity, or earth science.",
        icon: <SearchRounded />,
        color: "#38bdf8",
      },
      {
        n: "02",
        title: "Experiment visually",
        desc: "Change variables, run experiments, compare outcomes, and observe patterns.",
        icon: <InsightsRounded />,
        color: "#f472b6",
      },
      {
        n: "03",
        title: "Discuss and explain",
        desc: "Use questions, graphs, worksheets, and teacher notes to support learning.",
        icon: <VerifiedRounded />,
        color: "#34d399",
      },
    ],
    [],
  );

  const audiences = useMemo(
    () => [
      {
        title: "Teachers",
        color: "#3b82f6",
        icon: <SchoolRounded fontSize="large" />,
        tag: "Classroom Ready",
        desc: "Use Esbiko to demonstrate science concepts, guide investigations, and support classroom discussion.",
        points: [
          "Interactive classroom demonstrations",
          "Teacher guides and worksheets",
          "Inquiry-based science activities",
        ],
      },
      {
        title: "Students",
        color: "#ec4899",
        icon: <AutoStoriesRounded fontSize="large" />,
        tag: "Self-paced Learning",
        desc: "Explore science by changing variables, observing patterns, and connecting visual experiments with data.",
        points: [
          "Learn by experimenting",
          "Visualise difficult concepts",
          "Use graphs and real-time feedback",
        ],
      },
      {
        title: "Science Enthusiasts",
        color: "#22c55e",
        icon: <ExploreRounded fontSize="large" />,
        tag: "Explore Freely",
        desc: "Esbiko is also for curious minds who enjoy physics, astronomy, earth science, and STEM exploration.",
        points: [
          "Explore science for fun",
          "Discover real-world phenomena",
          "No classroom required",
        ],
      },
    ],
    [],
  );

  return (
    <Page>
      {/* ================= HERO ================= */}
      <Section compact>
        <Stack spacing={4} alignItems="center" sx={{ textAlign: "center" }}>
          <Chip
            label="Free public beta for teachers, students, and curious minds"
            icon={<BoltRounded sx={{ fontSize: "16px !important" }} />}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              height: 34,
              px: 1,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              lineHeight: 1.04,
              fontSize: { xs: "2.6rem", sm: "3.6rem", md: "5.2rem" },
              maxWidth: 1050,
            }}
          >
            Interactive Science Labs <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              for classrooms, students, and curious minds
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 760,
              color: "rgba(255,255,255,0.74)",
              fontSize: { xs: "1rem", md: "1.15rem" },
              lineHeight: 1.75,
            }}
          >
            Esbiko is a virtual science lab where learners can explore physics,
            astronomy, earth science, and STEM concepts through interactive
            simulations, visual data, and guided learning activities.
          </Typography>

          <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: 520 }}>
              <TextField
                fullWidth
                placeholder="Search simulations: gravity, optics, waves, space..."
                onFocus={() => navigate("/experiments")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "rgba(30,41,59,0.65)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    pr: 1,
                  },
                  "& input": { color: "white" },
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
                      aria-label="Search simulations"
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

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<RocketLaunchRounded />}
                onClick={() => navigate("/experiments")}
                sx={{
                  borderRadius: 999,
                  px: 4,
                  py: 1.4,
                  fontWeight: 900,
                  background:
                    "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                  color: "white",
                }}
              >
                Explore Simulations
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<WorkspacePremiumRounded />}
                onClick={() =>
                  navigate("/experiments/physics.mechanics.projectile")
                }
                sx={{
                  borderRadius: 999,
                  px: 4,
                  py: 1.4,
                  fontWeight: 900,
                  color: "white",
                  borderColor: "rgba(255,255,255,0.22)",
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56,189,248,0.08)",
                  },
                }}
              >
                Launch Demo Lab
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              width: "100%",
              mt: { xs: 4, md: 5 },
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
              background: "rgba(2,6,23,0.35)",
              "& > div": {
                height: { xs: "320px !important", md: "430px !important" },
              },
            }}
          >
            <SolarCinematicHero />
          </Box>
        </Stack>
      </Section>

      {/* ================= WHY ESBIKO ================= */}
      <Section compact>
        <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center", mb: 6 }}>
          <Typography variant="h2" fontWeight={900} sx={{ mb: 2 }}>
            A virtual science lab for teaching, learning, and exploration
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
            }}
          >
            Esbiko helps learners move beyond static diagrams. Students can
            change variables, observe results, compare outcomes, and connect
            visual experiments with scientific explanations.
          </Typography>
        </Box>

        <CardGrid columns={3}>
          {whyEsbiko.map((item) => (
            <GlassCard key={item.title} sx={{ p: 4, height: "100%" }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: alpha(item.color, 0.16),
                  color: item.color,
                  border: `1px solid ${alpha(item.color, 0.28)}`,
                  mb: 2,
                }}
              >
                {item.icon}
              </Avatar>

              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                {item.title}
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.75,
                }}
              >
                {item.desc}
              </Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= FEATURED LABS ================= */}
      <Section compact>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: "#38bdf8", letterSpacing: 1.5, fontWeight: 900 }}
          >
            Start here
          </Typography>

          <Typography variant="h3" fontWeight={900} sx={{ mt: 1 }}>
            Featured science labs
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              mt: 2,
              maxWidth: 680,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Begin with a few strong simulations while Esbiko grows into a
            broader classroom-ready science platform.
          </Typography>
        </Box>

        <CardGrid columns={3}>
          {featuredLabs.map((lab) => (
            <GlassCard
              key={lab.title}
              sx={{
                p: 4,
                minHeight: 310,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: alpha(lab.color, 0.16),
                  color: lab.color,
                  mb: 2.5,
                  border: `1px solid ${alpha(lab.color, 0.28)}`,
                }}
              >
                {lab.icon}
              </Avatar>

              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Typography variant="h5" fontWeight={900}>
                  {lab.title}
                </Typography>

                <Chip
                  label={lab.tag}
                  size="small"
                  sx={{
                    bgcolor: alpha(lab.color, 0.14),
                    color: lab.color,
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.75,
                  mb: 3,
                  flex: 1,
                }}
              >
                {lab.desc}
              </Typography>

              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate(lab.href)}
                sx={{
                  alignSelf: "flex-start",
                  color: lab.color,
                  fontWeight: 900,
                }}
              >
                Open Lab
              </Button>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= CLASSROOM RESOURCES ================= */}
      <Section compact>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: "#38bdf8", letterSpacing: 1.5, fontWeight: 900 }}
          >
            Classroom support
          </Typography>

          <Typography variant="h3" fontWeight={900} sx={{ mt: 1 }}>
            Designed to support real teaching
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              mt: 2,
              maxWidth: 760,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Esbiko is not only a collection of simulations. The goal is to
            provide teacher-friendly resources that make science easier to
            demonstrate, investigate, and discuss.
          </Typography>
        </Box>

        <CardGrid columns={3}>
          {resources.map((item) => (
            <GlassCard key={item.title} sx={{ p: 4, height: "100%" }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: alpha(item.color, 0.16),
                  color: item.color,
                  border: `1px solid ${alpha(item.color, 0.28)}`,
                  mb: 2,
                }}
              >
                {item.icon}
              </Avatar>

              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                {item.title}
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.75,
                }}
              >
                {item.desc}
              </Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= LEARNING FLOW ================= */}
      <Section compact>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: "#38bdf8", letterSpacing: 1.5, fontWeight: 900 }}
          >
            Learning flow
          </Typography>

          <Typography variant="h3" fontWeight={900} sx={{ mt: 1 }}>
            Three steps to active science learning
          </Typography>
        </Box>

        <CardGrid columns={3}>
          {steps.map((s) => (
            <GlassCard
              key={s.n}
              sx={{
                p: 4,
                minHeight: 270,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(s.color, 0.12),
                  color: s.color,
                  border: `1px solid ${alpha(s.color, 0.25)}`,
                  mb: 2,
                }}
              >
                {s.icon}
              </Avatar>

              <Typography
                variant="caption"
                sx={{ color: s.color, fontWeight: 900, letterSpacing: 1 }}
              >
                {s.n}
              </Typography>

              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                {s.title}
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.7,
                }}
              >
                {s.desc}
              </Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= AUDIENCE ================= */}
      <Section compact>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontWeight: 900, mb: 2 }}
        >
          Built for classrooms and beyond
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.65)",
            maxWidth: 760,
            mx: "auto",
            mb: 6,
            lineHeight: 1.7,
          }}
        >
          Esbiko is mainly designed for education, but science is not only for
          schools. Anyone who enjoys learning can explore.
        </Typography>

        <CardGrid columns={3}>
          {audiences.map((a) => (
            <GlassCard
              key={a.title}
              sx={{
                p: 4,
                minHeight: 420,
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
                  bgcolor: alpha(a.color, 0.18),
                  color: a.color,
                  mb: 2,
                  border: `1px solid ${alpha(a.color, 0.25)}`,
                }}
              >
                {a.icon}
              </Avatar>

              <Typography variant="h5" fontWeight={900}>
                {a.title}
              </Typography>

              <Chip
                label={a.tag}
                size="small"
                sx={{
                  mt: 1,
                  mb: 3,
                  bgcolor: alpha(a.color, 0.16),
                  color: a.color,
                  fontWeight: 800,
                }}
              />

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.68)",
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                {a.desc}
              </Typography>

              <Box
                sx={{
                  display: "inline-flex",
                  flexDirection: "column",
                  gap: 1.5,
                  textAlign: "left",
                  width: "100%",
                  mt: "auto",
                }}
              >
                {a.points.map((p) => (
                  <Stack key={p} direction="row" spacing={1.5}>
                    <CheckCircleRounded sx={{ color: a.color, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700}>
                      {p}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= TECH / TRUST ================= */}
      <Section compact>
        <CardGrid columns={4}>
          {[
            "Browser-based labs",
            "No installation required",
            "Desktop and tablet friendly",
            "Built for visual STEM learning",
          ].map((item) => (
            <GlassCard
              key={item}
              sx={{
                p: 3,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.2,
              }}
            >
              <DevicesRounded sx={{ color: "#38bdf8" }} />
              <Typography fontWeight={800}>{item}</Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* ================= CTA ================= */}
      <Section compact>
        <Box
          sx={{
            maxWidth: 940,
            mx: "auto",
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(56,189,248,0.16), rgba(129,140,248,0.06), rgba(0,0,0,0))",
            border: "1px solid rgba(56,189,248,0.25)",
          }}
        >
          <Chip
            label="Public beta"
            sx={{
              bgcolor: "rgba(56,189,248,0.12)",
              color: "#7dd3fc",
              fontWeight: 900,
              mb: 2,
            }}
          />

          <Typography variant="h4" fontWeight={900} mb={2}>
            Start exploring Esbiko for free
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.68)",
              mb: 4,
              lineHeight: 1.8,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            Esbiko is currently growing as a free public beta. Try the
            simulations, use them in learning, and help shape the future of
            classroom-ready virtual science labs.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/experiments")}
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.6,
                background: "white",
                color: "black",
                fontWeight: 900,
                fontSize: "1rem",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              Explore Simulations
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/about")}
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.6,
                color: "white",
                borderColor: "rgba(255,255,255,0.22)",
                fontWeight: 900,
                "&:hover": {
                  borderColor: "#38bdf8",
                  bgcolor: "rgba(56,189,248,0.08)",
                },
              }}
            >
              Learn About Esbiko
            </Button>
          </Stack>
        </Box>
      </Section>
    </Page>
  );
}
