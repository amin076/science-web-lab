// ✅ src/components/layout/Footer.jsx

import {
  Box,
  Typography,
  Divider,
  Grid,
  Link,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";

import { useTheme, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Experiments", href: "/experiments" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const subjectLinks = [
  { label: "Physics", href: "/experiments#physics" },
  { label: "Mechanics", href: "/experiments#mechanics" },
  { label: "Optics", href: "/experiments#optics" },
  { label: "Electricity", href: "/experiments#electricity" },
  { label: "Astronomy", href: "/experiments#astronomy" },
  { label: "Earth Science", href: "/experiments#earth-science" },
];

const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Esbiko-Science",
    icon: <YouTubeIcon fontSize="small" />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/esbiko",
    icon: <LinkedInIcon fontSize="small" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/esbiko.science",
    icon: <InstagramIcon fontSize="small" />,
  },
  {
    label: "GitHub",
    href: "https://github.com/amin076/science-web-lab",
    icon: <GitHubIcon fontSize="small" />,
  },
];

export default function Footer() {
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  const textColor = isDark ? "#f8fafc" : "#0f172a";

  const mutedColor = isDark ? "rgba(248,250,252,0.72)" : "rgba(15,23,42,0.72)";

  const footerLinkStyle = {
    color: mutedColor,
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "all 0.25s ease",
    width: "fit-content",

    "&:hover": {
      color: textColor,
      transform: "translateX(4px)",
    },
  };

  return (
    <>
      <Box
        component="footer"
        sx={{
          mt: 0,
          position: "relative",
          overflow: "hidden",
          zIndex: 10,

          boxShadow: isDark
            ? "0 -2px 18px rgba(59,130,246,0.25)"
            : "0 -2px 15px rgba(56,189,248,0.25)",
        }}
      >
        {/* Top Glow Divider */}
        <Box
          sx={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)",
            position: "relative",
            zIndex: 2,
          }}
        />

        {/* 🌈 Animated Gradient Background */}
        <Box
          component={motion.div}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 25,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          sx={{
            position: "absolute",
            inset: 0,

            background: isDark
              ? "linear-gradient(120deg, #0f172a, #1e3a8a, #312e81, #1d4ed8)"
              : "linear-gradient(120deg, #e0f2fe, #93c5fd, #67e8f9, #60a5fa)",

            backgroundSize: "400% 400%",
            opacity: isDark ? 0.97 : 0.94,

            zIndex: 0,
          }}
        />

        {/* Glow Effect */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: alpha("#ffffff", isDark ? 0.08 : 0.24),
            filter: "blur(12px)",
            zIndex: 0,
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,

            maxWidth: 1400,
            mx: "auto",

            px: { xs: 2.5, sm: 4, md: 6 },
            py: { xs: 4, md: 4.5 },

            color: textColor,
          }}
        >
          <Grid container spacing={{ xs: 3, md: 3 }}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,

                    borderRadius: "16px",

                    overflow: "hidden",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    background: alpha("#ffffff", isDark ? 0.12 : 0.35),

                    border: `1px solid ${alpha("#ffffff", 0.25)}`,

                    backdropFilter: "blur(10px)",

                    boxShadow: isDark
                      ? "0 0 18px rgba(59,130,246,0.35)"
                      : "0 0 18px rgba(56,189,248,0.28)",
                  }}
                >
                  <Box
                    component="img"
                    src="/esbiko-logo-192.png"
                    alt="Esbiko Logo"
                    sx={{
                      width: "72%",
                      height: "72%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    Esbiko
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: mutedColor,
                    }}
                  >
                    Interactive Science Labs
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: mutedColor,
                  lineHeight: 1.9,
                  maxWidth: 420,
                  mb: 2,
                }}
              >
                Explore interactive virtual science labs for physics, astronomy,
                earth science, and STEM education. Learn visually through
                simulations, experiments, and classroom-ready activities.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="Virtual Labs"
                  size="small"
                  sx={{
                    color: textColor,
                    background: alpha("#ffffff", isDark ? 0.12 : 0.35),
                    border: `1px solid ${alpha("#ffffff", 0.22)}`,
                  }}
                />

                <Chip
                  label="Interactive Labs"
                  size="small"
                  sx={{
                    color: textColor,
                    background: alpha("#ffffff", isDark ? 0.12 : 0.35),
                    border: `1px solid ${alpha("#ffffff", 0.22)}`,
                  }}
                />

                <Chip
                  label="STEM Education"
                  size="small"
                  sx={{
                    color: textColor,
                    background: alpha("#ffffff", isDark ? 0.12 : 0.35),
                    border: `1px solid ${alpha("#ffffff", 0.22)}`,
                  }}
                />
              </Stack>
            </Grid>

            {/* Explore */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1.8,
                }}
              >
                Explore
              </Typography>

              <Stack spacing={1.2}>
                {exploreLinks.map((link) => (
                  <Link key={link.label} href={link.href} sx={footerLinkStyle}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Subjects */}
            <Grid item xs={6} sm={4} md={3}>
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1.8,
                }}
              >
                Subjects
              </Typography>

              <Stack spacing={1.2}>
                {subjectLinks.map((link) => (
                  <Link key={link.label} href={link.href} sx={footerLinkStyle}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Community */}
            <Grid item xs={12} md={3}>
              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1.8,
                }}
              >
                Community
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: mutedColor,
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Follow Esbiko for science simulations, educational videos, and
                interactive STEM learning.
              </Typography>

              <Stack direction="row" spacing={1} mt={1}>
                {socialLinks.map(({ label, href, icon }) => (
                  <IconButton
                    key={label}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    sx={{
                      color: textColor,

                      background: alpha("#ffffff", isDark ? 0.12 : 0.35),

                      border: `1px solid ${alpha("#ffffff", 0.22)}`,

                      backdropFilter: "blur(8px)",

                      transition: "all 0.25s ease",

                      "&:hover": {
                        transform: "translateY(-4px) scale(1.05)",

                        background: alpha("#ffffff", isDark ? 0.22 : 0.55),

                        boxShadow: isDark
                          ? "0 0 18px rgba(59,130,246,0.35)"
                          : "0 0 18px rgba(56,189,248,0.28)",
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 4,

              background:
                "linear-gradient(90deg, transparent, rgba(96,165,250,0.42), transparent)",
            }}
          />

          {/* Bottom */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: textColor,
                lineHeight: 1.8,
              }}
            >
              © {new Date().getFullYear()} Esbiko. Interactive virtual science
              labs for classrooms, students, and curious minds.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: mutedColor,
              }}
            >
              Built for science exploration, visual learning, and
              classroom-ready STEM education.
            </Typography>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
