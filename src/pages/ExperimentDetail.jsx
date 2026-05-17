// src/pages/ExperimentDetail.jsx
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import { experimentsData } from "@/data/experiments/index";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { motion } from "framer-motion";

const DEFAULT_GRADIENT = "linear-gradient(135deg, #2563eb, #38bdf8)";

export default function ExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const experiment = experimentsData.find((exp) => exp.id === id);

  useEffect(() => {
    if (!experiment) return;

    const safeName = experiment.name || "Science Experiment";
    const safeDesc =
      experiment.desc ||
      "Explore this interactive science simulation in Esbiko.";

    const pageTitle = `${safeName} Simulation | Esbiko Virtual Lab`;
    const pageDescription = `${safeName} simulation. ${safeDesc}`;

    document.title = pageTitle;

    let metaDescription = document.querySelector("meta[name='description']");
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", pageDescription);

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      `https://www.esbiko.com/experiments/${experiment.id}`,
    );

    const setOrCreateMeta = (selector, attrName, attrValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setOrCreateMeta(
      "meta[property='og:title']",
      "property",
      "og:title",
      pageTitle,
    );
    setOrCreateMeta(
      "meta[property='og:description']",
      "property",
      "og:description",
      pageDescription,
    );
    setOrCreateMeta(
      "meta[property='og:url']",
      "property",
      "og:url",
      `https://www.esbiko.com/experiments/${experiment.id}`,
    );
    setOrCreateMeta(
      "meta[name='twitter:title']",
      "name",
      "twitter:title",
      pageTitle,
    );
    setOrCreateMeta(
      "meta[name='twitter:description']",
      "name",
      "twitter:description",
      pageDescription,
    );
    const safeSubject = experiment.subject || "science";
    const schemaId = "experiment-detail-schema";

    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = document.createElement("script");
    schema.id = schemaId;
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: pageTitle,
      description: pageDescription,
      url: `https://www.esbiko.com/experiments/${experiment.id}`,
      image: "https://www.esbiko.com/esbiko-logo-512.png",
      learningResourceType: "Simulation",
      educationalUse: "Interactive learning",
      educationalLevel: "Secondary school",
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: "Esbiko",
        url: "https://www.esbiko.com/",
        logo: "https://www.esbiko.com/esbiko-logo-512.png",
      },
      about: safeSubject,
    });

    document.head.appendChild(schema);
    return () => {
      const schemaToRemove = document.getElementById(schemaId);
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [experiment]);

  if (!experiment) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 2,
            background: "linear-gradient(to right, #ef4444, #f87171)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Experiment Not Found
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/experiments")}>
          Return to Lab
        </Button>
      </Box>
    );
  }

  const {
    name,
    desc = "Explore this interactive science simulation in Esbiko.",
    shortDesc,
    yearLevel,
    difficulty,
    estimatedTime,
    supportedDevices,
    lessonType = [],
    learningObjectives = [],
    curriculumLinks = [],
    classroomActivity,
    discussionQuestions = [],
    worksheet,
    teacherGuide,
    youtubeIdeas = [],
    Icon,
    gradient = DEFAULT_GRADIENT,
    subject = "science",
  } = experiment;

  const safeGradient = gradient || DEFAULT_GRADIENT;
  const safeSubject = subject || "science";

  // 🛠️ HELPER: Smartly render Image URL or MUI Component
  const renderIcon = (size = 60, isBackground = false) => {
    // 1. If Icon is a URL String (3D Image)
    if (
      typeof Icon === "string" &&
      (Icon.includes("http") || Icon.includes(".png"))
    ) {
      return (
        <Box
          component="img"
          src={Icon}
          alt={name}
          sx={{
            width: size,
            height: size,
            objectFit: "contain",
            // If it's the giant background one, we don't need drop shadow
            filter: isBackground
              ? "none"
              : "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
          }}
        />
      );
    }

    // 2. If Icon is a React Component (Legacy MUI Icon)
    const ValidIcon =
      typeof Icon === "object" || typeof Icon === "function"
        ? Icon
        : ScienceOutlinedIcon;
    return <ValidIcon sx={{ fontSize: size, color: "white" }} />;
  };

  // 💎 Reusable Glass Style
  const glassPanelStyle = {
    background: "rgba(30, 41, 59, 0.4)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    borderRadius: "24px",
    overflow: "hidden",
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 8, pt: 4, position: "relative" }}>
      {/* 🌑 Background Ambiance */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            background: safeGradient,
            filter: "blur(120px)",
            opacity: 0.15,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background: "#4f46e5",
            filter: "blur(120px)",
            opacity: 0.1,
          }}
        />
      </Box>

      <Container maxWidth="lg">
        {/* 🔙 Navigation Bar */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/experiments")}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                color: "white",
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Back to Experiments
          </Button>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Save for later">
              <IconButton
                sx={{ color: "text.secondary", "&:hover": { color: "white" } }}
              >
                <BookmarkBorderOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton
                sx={{ color: "text.secondary", "&:hover": { color: "white" } }}
              >
                <ShareOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 🦸 HERO SECTION */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            ...glassPanelStyle,
            p: { xs: 3, md: 6 },
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 4,
            position: "relative",
          }}
        >
          {/* Decorative Giant Icon Background */}
          <Box
            sx={{
              position: "absolute",
              right: -20,
              bottom: -40,
              opacity: 0.05,
              transform: "rotate(-15deg)",
              pointerEvents: "none", // Prevent blocking clicks
            }}
          >
            {/* ✅ Use Helper with Large Size */}
            {renderIcon(400, true)}
          </Box>

          {/* Left: Icon & Gradient Ring */}
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 40px rgba(56,189,248,0.25)",
              }}
            >
              {/* ✅ Use Helper with Normal Size */}
              {renderIcon(70)}
            </Box>

            {/* Status Chip */}
            <Chip
              label="Interactive"
              size="small"
              sx={{
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                background: safeGradient,
                color: "white",
                fontWeight: 700,
                border: "2px solid #1e293b",
              }}
            />
          </Box>

          {/* Right: Text Info */}
          <Box
            sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, zIndex: 1 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              {safeSubject.toUpperCase()} LAB
            </Typography>

            <Typography
              component="h1"
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 1,
                background: "linear-gradient(to bottom, #ffffff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {name} Simulation
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "center", md: "flex-start" }}
              alignItems="center"
            >
              <Chip
                label="Physics Engine: v2.0"
                variant="outlined"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                size="small"
              />
              <Chip
                label="3D Render"
                variant="outlined"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                size="small"
              />
            </Stack>
          </Box>
        </Box>

        {/* 📄 CONTENT GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 2fr) minmax(320px, 1fr)",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* Main Content Column */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {/* Main Description */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              sx={{
                ...glassPanelStyle,
                p: 4,
              }}
            >
              <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <ScienceOutlinedIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  About this Experiment
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                }}
              >
                {desc}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                  {name} Simulation Overview
                </Typography>

                <Typography
                  sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}
                >
                  This interactive {name.toLowerCase()} simulation allows
                  students to explore key concepts in {safeSubject}. By
                  adjusting variables and observing results in real time,
                  learners can better understand cause-and-effect relationships
                  and develop intuition in scientific experiments.
                </Typography>
              </Box>

              {learningObjectives.length > 0 && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(0,0,0,0.2)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
                  >
                    🎓 Learning Objectives
                  </Typography>

                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 20,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.8,
                    }}
                  >
                    {learningObjectives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>

            {classroomActivity && (
              <Box sx={{ ...glassPanelStyle, p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  🧪 Classroom Activity
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}>
                  {classroomActivity.title}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 2 }}>
                  Duration: {classroomActivity.duration}
                </Typography>

                <ol
                  style={{
                    paddingLeft: 20,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  {classroomActivity.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Box>
            )}

            {discussionQuestions.length > 0 && (
              <Box sx={{ ...glassPanelStyle, p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  💬 Discussion Questions
                </Typography>

                <ul
                  style={{
                    paddingLeft: 20,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  {discussionQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </Box>
            )}

            {teacherGuide && (
              <Box sx={{ ...glassPanelStyle, p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  👨‍🏫 Teacher Guide
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}>
                  <strong>Duration:</strong> {teacherGuide.duration}
                </Typography>

                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", mt: 2, mb: 1 }}
                >
                  Prior Knowledge
                </Typography>

                <ul style={{ paddingLeft: 20, color: "rgba(255,255,255,0.7)" }}>
                  {teacherGuide.priorKnowledge.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", mt: 3, mb: 1 }}
                >
                  Common Misconceptions
                </Typography>

                <ul style={{ paddingLeft: 20, color: "rgba(255,255,255,0.7)" }}>
                  {teacherGuide.misconceptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", mt: 3, mb: 1 }}
                >
                  Real World Examples
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {teacherGuide.realWorldExamples.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      sx={{
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {worksheet && (
              <Box sx={{ ...glassPanelStyle, p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  📝 Student Worksheet Preview
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}>
                  <strong>Aim:</strong> {worksheet.aim}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 2 }}>
                  <strong>Prediction:</strong> {worksheet.prediction}
                </Typography>

                {worksheet.variables && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: "white", mb: 1 }}>
                      Variables
                    </Typography>

                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <strong>Independent:</strong>{" "}
                      {worksheet.variables.independent}
                    </Typography>

                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <strong>Dependent:</strong>{" "}
                      {worksheet.variables.dependent}
                    </Typography>

                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <strong>Controlled:</strong>{" "}
                      {worksheet.variables.controlled?.join(", ")}
                    </Typography>
                  </Box>
                )}

                {worksheet.questions?.length > 0 && (
                  <>
                    <Typography sx={{ color: "white", mt: 2, mb: 1 }}>
                      Questions
                    </Typography>

                    <ol
                      style={{
                        paddingLeft: 20,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.8,
                      }}
                    >
                      {worksheet.questions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ol>
                  </>
                )}

                {worksheet.extension && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      background: "rgba(14,165,233,0.08)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <Typography sx={{ color: "white", fontWeight: 700 }}>
                      Extension Challenge
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                      {worksheet.extension}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>

          {/* Sidebar Column */}
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {(yearLevel || curriculumLinks.length > 0) && (
              <Box sx={{ ...glassPanelStyle, p: 3 }}>
                {yearLevel && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "white", mb: 1 }}
                    >
                      📘 Recommended Level
                    </Typography>

                    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                      {yearLevel}
                    </Typography>
                  </>
                )}

                {curriculumLinks.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "white", mb: 1 }}
                    >
                      🧠 Curriculum Topics
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {curriculumLinks.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          size="small"
                          sx={{
                            background: "rgba(255,255,255,0.08)",
                            color: "white",
                          }}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            )}

            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              sx={{
                ...glassPanelStyle,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Ready to explore?
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}
              >
                Launch the simulation environment to start experimenting.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => navigate(`/experiments/${id}/run`)}
                sx={{
                  background: safeGradient,
                  color: "white",
                  fontWeight: 800,
                  py: 1.5,
                  borderRadius: "12px",
                  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.4)",
                  "&:hover": {
                    filter: "brightness(1.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 25px -5px rgba(0,0,0,0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Launch Simulation
              </Button>
            </Box>

            <Box sx={{ ...glassPanelStyle, p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                📚 Teacher Resources
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  startIcon={<DescriptionRoundedIcon />}
                  fullWidth
                  variant="outlined"
                >
                  Download Worksheet
                </Button>

                <Button
                  startIcon={<SchoolRoundedIcon />}
                  fullWidth
                  variant="outlined"
                >
                  Teacher Guide
                </Button>

                <Button
                  startIcon={<DownloadRoundedIcon />}
                  fullWidth
                  variant="outlined"
                >
                  Classroom Activity PDF
                </Button>

                <Button
                  startIcon={<GroupsRoundedIcon />}
                  fullWidth
                  variant="outlined"
                >
                  Share with Students
                </Button>
              </Stack>
            </Box>

            <Box sx={{ ...glassPanelStyle, p: 3 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 2, color: "white" }}
              >
                Simulation Specs
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Difficulty
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    {difficulty || "Intermediate"}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Est. Time
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    {estimatedTime || "15–30 mins"}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Device
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white" }}>
                    {supportedDevices || "Desktop / Tablet"}
                  </Typography>
                </Stack>

                {lessonType.length > 0 && (
                  <Box sx={{ pt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Lesson Type
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {lessonType.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          size="small"
                          sx={{
                            background: "rgba(255,255,255,0.08)",
                            color: "white",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
