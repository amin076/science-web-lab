// src/pages/About.jsx
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  Chip,
  Avatar,
  Divider,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
const Page = ({ children }) => (
  <Box
    component="main"
    sx={{
      bgcolor: "#020617",
      color: "white",
      overflowX: "hidden",
    }}
  >
    {children}
  </Box>
);

const Section = ({ children, compact = false, sx = {} }) => (
  <Box
    component="section"
    sx={{
      width: "100%",
      py: compact ? { xs: 4, md: 5 } : { xs: 6, md: 8 },
      ...sx,
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 3 } }}>
      {children}
    </Box>
  </Box>
);

const CardGrid = ({ children, columns = 3 }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        md: `repeat(${columns}, minmax(0, 1fr))`,
      },
      gap: 4,
    }}
  >
    {children}
  </Box>
);

const GlassCard = ({ children, sx }) => (
  <Card
    component={motion.div}
    whileHover={{ y: -5 }}
    elevation={0}
    sx={{
      p: 4,
      height: "100%",
      borderRadius: 4,
      background: "rgba(15,23,42,0.66)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
      color: "white",
      transition: "all 0.3s ease",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const IconAvatar = ({ icon, color }) => (
  <Avatar
    sx={{
      width: 64,
      height: 64,
      bgcolor: alpha(color, 0.16),
      color,
      border: `1px solid ${alpha(color, 0.28)}`,
      mb: 2,
    }}
  >
    {icon}
  </Avatar>
);

function About() {
  const navigate = useNavigate();

  const benefits = [
    {
      title: "Your lab at home",
      desc: "Open Esbiko from your browser and explore science experiments without needing a physical laboratory.",
      icon: <DevicesRoundedIcon />,
      color: "#38bdf8",
    },
    {
      title: "Experiment without fear",
      desc: "Try ideas, make mistakes, reset the simulation, and test again safely as many times as you like.",
      icon: <ShieldRoundedIcon />,
      color: "#22c55e",
    },
    {
      title: "No expensive materials",
      desc: "Virtual labs reduce the need for costly equipment, materials, setup time, and cleanup.",
      icon: <PaidRoundedIcon />,
      color: "#f59e0b",
    },
    {
      title: "Repeat and compare",
      desc: "Change variables, run multiple trials, compare outcomes, and build scientific understanding step by step.",
      icon: <RestartAltRoundedIcon />,
      color: "#a78bfa",
    },
  ];

  const audiences = [
    {
      title: "Teachers",
      desc: "Use Esbiko to demonstrate concepts, guide classroom investigations, and support discussion with visual experiments.",
      icon: <SchoolRoundedIcon />,
      color: "#3b82f6",
    },
    {
      title: "Students",
      desc: "Learn by testing ideas, observing results, and connecting science concepts with interactive visual feedback.",
      icon: <AutoStoriesRoundedIcon />,
      color: "#ec4899",
    },
    {
      title: "Curious Minds",
      desc: "Science is not only for schools. Anyone who enjoys physics, astronomy, earth science, and STEM can explore.",
      icon: <ExploreRoundedIcon />,
      color: "#22c55e",
    },
  ];

  const principles = [
    "Science should be explored, not only memorised.",
    "Students learn better when they can test ideas visually.",
    "Teachers need resources that save time and support real classroom use.",
    "Curiosity should be available anywhere, anytime, with one click.",
  ];

  return (
    <Page>
      {/* HERO */}
      <Section>
        <Stack spacing={4} alignItems="center" sx={{ textAlign: "center" }}>
          <Chip
            label="About Esbiko"
            icon={<ScienceRoundedIcon sx={{ fontSize: "16px !important" }} />}
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
              lineHeight: 1.05,
              fontSize: { xs: "2.7rem", sm: "3.7rem", md: "5.2rem" },
              maxWidth: 980,
            }}
          >
            A virtual science lab <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              always within reach
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 780,
              color: "rgba(255,255,255,0.74)",
              fontSize: { xs: "1rem", md: "1.15rem" },
              lineHeight: 1.8,
            }}
          >
            Esbiko is being built to help teachers, students, and curious minds
            explore science through interactive simulations, guided experiments,
            and visual learning. Instead of only reading formulas or looking at
            static diagrams, learners can test ideas directly in a browser.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketLaunchRoundedIcon />}
              onClick={() => navigate("/experiments")}
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.4,
                fontWeight: 900,
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                color: "white",
              }}
            >
              Explore Simulations
            </Button>

            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => navigate("/contact")}
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
              Contact Us
            </Button>
          </Stack>
        </Stack>
      </Section>

      {/* SCIENCE HOME IMAGE */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, md: 4 },
          mb: 8,
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(10,15,35,0.96))",
            boxShadow: `
  0 0 80px rgba(59,130,246,0.18),
  0 0 140px rgba(168,85,247,0.10)
`,
          }}
        >
          <Box
            component="img"
            src="/images/about/science-home-lab.png"
            alt="Science learning at home"
            sx={{
              width: "100%",
              height: { xs: 320, md: 620 },
              display: "block",
              objectFit: "center",
              borderRadius: "3px",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(2,6,23,0.55), rgba(2,6,23,0.02))",
            }}
          />
        </Box>
      </Box>
      {/* WHY */}
      <Section compact>
        <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center", mb: 6 }}>
          <Typography variant="h2" fontWeight={900} sx={{ mb: 2 }}>
            Why Esbiko exists
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "1.05rem",
              lineHeight: 1.85,
            }}
          >
            Many science ideas are difficult to understand from text alone.
            Motion, gravity, light, waves, space, and energy become clearer when
            learners can change variables, observe outcomes, and repeat
            experiments. Esbiko aims to make that kind of active science
            learning more accessible.
          </Typography>
        </Box>

        <CardGrid columns={4}>
          {benefits.map((item) => (
            <GlassCard key={item.title}>
              <IconAvatar icon={item.icon} color={item.color} />
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                {item.title}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.75 }}
              >
                {item.desc}
              </Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* BIG MESSAGE */}
      <Section compact>
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            background:
              "linear-gradient(135deg, rgba(56,189,248,0.14), rgba(129,140,248,0.08), rgba(192,132,252,0.08))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight={900}>
              Think of an idea. Open your lab. Test it.
            </Typography>

            <Typography
              sx={{
                maxWidth: 850,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.9,
                fontSize: "1.05rem",
              }}
            >
              When a science question comes to your mind, Esbiko should help you
              move quickly from curiosity to experimentation. With one click,
              learners can open a virtual lab, adjust settings, run a
              simulation, observe results, and explain what they discovered.
            </Typography>
          </Stack>
        </Box>
      </Section>

      {/* AUDIENCE */}
      <Section compact>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
            Built for classrooms and beyond
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              maxWidth: 760,
              mx: "auto",
              lineHeight: 1.75,
            }}
          >
            Esbiko is mainly designed for education, but science belongs to
            everyone. It can support teachers, students, independent learners,
            families, and science enthusiasts.
          </Typography>
        </Box>

        <CardGrid columns={3}>
          {audiences.map((item) => (
            <GlassCard key={item.title} sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <IconAvatar icon={item.icon} color={item.color} />
              </Box>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>
                {item.title}
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.75 }}
              >
                {item.desc}
              </Typography>
            </GlassCard>
          ))}
        </CardGrid>
      </Section>

      {/* PRINCIPLES */}
      <Section compact>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ textAlign: "center", mb: 5 }}
          >
            Our learning principles
          </Typography>

          <GlassCard sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2.5}>
              {principles.map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                >
                  <CheckCircleRoundedIcon
                    sx={{ color: "#38bdf8", mt: "3px" }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.78)",
                      lineHeight: 1.7,
                      fontSize: "1.02rem",
                    }}
                  >
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </GlassCard>
        </Box>
      </Section>

      {/* SHARE */}
      <Section compact>
        <CardGrid columns={2}>
          <GlassCard sx={{ p: { xs: 4, md: 5 } }}>
            <IconAvatar icon={<ShareRoundedIcon />} color="#38bdf8" />
            <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
              Share what you discover
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}
            >
              Science becomes more powerful when learners explain their ideas to
              others. Esbiko is being designed so students and users can share
              simulations, compare results, and discuss what they found with
              classmates, teachers, friends, or the wider community.
            </Typography>
          </GlassCard>

          <GlassCard sx={{ p: { xs: 4, md: 5 } }}>
            <IconAvatar icon={<ScienceRoundedIcon />} color="#a78bfa" />
            <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
              A growing public beta
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}
            >
              Esbiko is currently growing as a free public beta. The goal is to
              improve a focused set of classroom-ready simulations, collect real
              feedback, and gradually build stronger tools for teachers,
              students, and science learners.
            </Typography>
          </GlassCard>
        </CardGrid>
      </Section>

      {/* CTA */}
      <Section
        compact
        sx={{
          pt: { xs: 3, md: 4 },
          pb: 0,
          mb: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: 940,
            mx: "auto",
            textAlign: "center",
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(56,189,248,0.16), rgba(129,140,248,0.06), rgba(0,0,0,0))",
            border: "1px solid rgba(56,189,248,0.25)",
          }}
        >
          <Typography variant="h4" fontWeight={900} mb={2}>
            Start exploring science visually
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
            Open a virtual lab, test an idea, change variables, and build
            understanding through exploration.
          </Typography>

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
        </Box>
      </Section>
    </Page>
  );
}

export default About;
