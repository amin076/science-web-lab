// src/pages/Experiments.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import ExperimentCard from "@/components/experiments/ExperimentCard";
import { getPopularExperimentIds } from "@/services/experimentStats";

// ✅ modular catalog exports (fix: index, not "insex")
import {
  experimentsData,
  catalogNav,
  searchExperiments,
} from "@/data/experiments/index";

function makeAnchor(domain, topic) {
  return `sec-${domain}-${topic}`;
}

export default function Experiments() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState("physics");

  // Drawer domain expand states
  const [openDomains, setOpenDomains] = useState(() => new Set(["physics"]));

  // Popular (top 3)
  const [popular, setPopular] = useState([]);

  // refs for smooth-scroll (in case ids appear multiple times with filtered search)
  const sectionRefs = useRef({});

  // Build labels from catalogNav (no DOMAIN_LABELS/TOPIC_LABELS exports needed)
  const domainLabelMap = useMemo(() => {
    return new Map(
      (catalogNav || []).map((d) => [d.domain, d.label || d.domain]),
    );
  }, []);

  const topicLabelMap = useMemo(() => {
    return new Map(
      (catalogNav || []).flatMap((d) =>
        (d.topics || []).map((t) => [
          `${d.domain}:${t.topic}`,
          t.label || t.topic,
        ]),
      ),
    );
  }, []);

  const getDomainLabel = useCallback(
    (d) => domainLabelMap.get(d) || d,
    [domainLabelMap],
  );

  const getTopicLabel = useCallback(
    (d, t) => topicLabelMap.get(`${d}:${t}`) || t,
    [topicLabelMap],
  );

  const toggleDomainOpen = (domain) => {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const handleStart = useCallback(
    (id) => navigate(`/experiments/${id}/run`),
    [navigate],
  );

  const handleDetails = useCallback(
    (id) => navigate(`/experiments/${id}`),
    [navigate],
  );

  // Fast id->experiment lookup (important for 500+)
  const expMap = useMemo(
    () => new Map(experimentsData.map((e) => [e.id, e])),
    [],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const ids = await getPopularExperimentIds(3);

        const mapped = ids.map((id) => expMap.get(id)).filter(Boolean);

        // Fallback if there are no stats yet
        const fallback = experimentsData.filter((e) => e.demo).slice(0, 3);

        if (mounted) setPopular(mapped.length ? mapped : fallback);
      } catch {
        const fallback = experimentsData.filter((e) => e.demo).slice(0, 3);
        if (mounted) setPopular(fallback);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [expMap]);

  // Filter list by search query (name/desc/domain/topic/id/tags)
  const filtered = useMemo(() => {
    return searchExperiments(q, experimentsData);
  }, [q]);

  // Build domain->topic->items from filtered list
  const grouped = useMemo(() => {
    const out = {};
    for (const e of filtered) {
      const d = e.domain || "other";
      const t = e.topic || "general";
      out[d] ??= {};
      out[d][t] ??= [];
      out[d][t].push(e);
    }
    // sort items by name
    for (const d of Object.keys(out)) {
      for (const t of Object.keys(out[d])) {
        out[d][t].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    return out;
  }, [filtered]);

  const domainTotals = useMemo(() => {
    const totals = {};
    for (const d of Object.keys(grouped)) {
      totals[d] = Object.values(grouped[d]).reduce(
        (acc, arr) => acc + arr.length,
        0,
      );
    }
    return totals;
  }, [grouped]);

  // Derived nav only for domains present in filtered results (keeps drawer clean)
  const navForFiltered = useMemo(() => {
    const domainsInFiltered = new Set(Object.keys(grouped));

    return (catalogNav || [])
      .filter((d) => domainsInFiltered.has(d.domain))
      .map((d) => {
        const topics = (d.topics || [])
          .map((t) => ({
            ...t,
            count: grouped?.[d.domain]?.[t.topic]?.length || 0,
          }))
          .filter((t) => t.count > 0);

        return {
          ...d,
          count: domainTotals[d.domain] || 0,
          topics,
        };
      })
      .filter((d) => d.count > 0);
  }, [grouped, domainTotals]);

  const scrollToAnchor = (anchorId) => {
    const el =
      document.getElementById(anchorId) ||
      sectionRefs.current[anchorId] ||
      null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setDrawerOpen(false);
    }
  };

  // Keep Physics first (nice UX)
  const domainOrder = useMemo(() => {
    const list = Object.keys(grouped);
    list.sort((a, b) => {
      if (a === "physics") return -1;
      if (b === "physics") return 1;
      return a.localeCompare(b);
    });
    return list;
  }, [grouped]);

  return (
    <>
      <Helmet>
        <title>Interactive Science Simulations | Esbiko Virtual Labs</title>
        <meta
          name="description"
          content="Explore interactive science simulations, virtual physics experiments, astronomy labs, and STEM learning tools with Esbiko."
        />
      </Helmet>

      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight={800}
            sx={{
              textAlign: "center",
              mb: 1,
              background: "linear-gradient(90deg,#2563eb,#38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Experiments Library
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Browse by domain & topic. Jump fast, find quickly, and start
            learning.
          </Typography>

          {/* ================= SEO INTRO ================= */}
          <Box sx={{ maxWidth: 900, mx: "auto", mb: 5, textAlign: "center" }}>
            <Typography variant="h2" fontWeight={800} sx={{ mb: 2 }}>
              Interactive Science Simulations and Virtual Experiments
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "1.1rem",
                lineHeight: 1.8,
              }}
            >
              Explore a growing collection of interactive science simulations
              and virtual experiments across physics, astronomy, earth science,
              mechanical engineering, and STEM education. Esbiko helps students
              and teachers learn scientific concepts by adjusting variables,
              observing results, and building intuition through browser-based
              virtual labs.
            </Typography>
          </Box>
          {/* Search + Nav Drawer button */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              mb: 3,
            }}
          >
            <TextField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search experiments (e.g. pendulum, optics, orbit...)"
              size="small"
              sx={{
                width: { xs: "100%", sm: 520 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title={drawerOpen ? "Close index" : "Open index"}>
              <IconButton
                onClick={() => setDrawerOpen((v) => !v)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  color: "#fff",
                  background: "linear-gradient(135deg,#2563eb,#38bdf8)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                  "&:hover": { filter: "brightness(1.08)" },
                }}
              >
                {drawerOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Domain chips (quick filter + jump) */}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {domainOrder.map((d) => (
              <Chip
                key={d}
                label={`${getDomainLabel(d)} (${domainTotals[d] || 0})`}
                onClick={() => {
                  setActiveDomain(d);
                  const topics = Object.keys(grouped[d] || {});
                  if (topics.length) scrollToAnchor(makeAnchor(d, topics[0]));
                }}
                sx={{
                  borderRadius: 999,
                  background:
                    activeDomain === d
                      ? "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(56,189,248,0.20))"
                      : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(10px)",
                }}
              />
            ))}
          </Stack>

          {/* Popular Top 3 (hide when searching) */}
          {!q.trim() && (
            <Box
              sx={{
                borderRadius: 4,
                p: { xs: 2, md: 3 },
                mb: 5,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.18)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  justifyContent: "center",
                }}
              >
                <TrendingUpRoundedIcon />
                <Typography variant="h6" fontWeight={800}>
                  Popular right now
                </Typography>
              </Box>

              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                }}
              >
                {popular.map((exp) => (
                  <ExperimentCard
                    key={exp.id}
                    {...exp}
                    onStart={() => handleStart(exp.id)}
                    onDetails={() => handleDetails(exp.id)}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ opacity: 0.15, mb: 5 }} />
        </Box>

        {/* Sections: Domain -> Topic -> Cards */}
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
          {domainOrder.map((domain) => {
            const topics = Object.keys(grouped[domain] || {});
            if (!topics.length) return null;

            topics.sort(
              (a, b) =>
                (grouped[domain][b]?.length || 0) -
                (grouped[domain][a]?.length || 0),
            );

            return (
              <Box key={domain} sx={{ mb: 6 }}>
                <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                  {getDomainLabel(domain)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Explore {getDomainLabel(domain)} topics and simulations.
                </Typography>

                {topics.map((topic) => {
                  const items = grouped[domain][topic] || [];
                  const anchorId = makeAnchor(domain, topic);

                  return (
                    <Box
                      key={`${domain}-${topic}`}
                      id={anchorId}
                      ref={(el) => (sectionRefs.current[anchorId] = el)}
                      sx={{ mb: 4 }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        sx={{ mb: 2, opacity: 0.95 }}
                      >
                        {getTopicLabel(domain, topic)}{" "}
                        <Box
                          component="span"
                          sx={{ opacity: 0.6, fontWeight: 700 }}
                        >
                          ({items.length})
                        </Box>
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gap: 3,
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                          },
                        }}
                      >
                        {items.map((exp) => (
                          <ExperimentCard
                            key={exp.id}
                            {...exp}
                            onStart={() => handleStart(exp.id)}
                            onDetails={() => handleDetails(exp.id)}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {/* Drawer: Domain + Topic index */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            className: "custom-scrollbar",
            sx: {
              width: 340,
              background: "linear-gradient(180deg,#0b1220,#0f1b33,#102a4d)",
              color: "#e5e7eb",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              Jump to topic
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Domains & topics (filtered by your search).
            </Typography>

            <List sx={{ p: 0 }}>
              {navForFiltered.map((d) => {
                const isOpen = openDomains.has(d.domain);

                return (
                  <Box key={d.domain} sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => toggleDomainOpen(d.domain)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={`${d.label || getDomainLabel(d.domain)}`}
                        secondary={`${d.count} simulations`}
                        secondaryTypographyProps={{ sx: { opacity: 0.7 } }}
                      />
                      {isOpen ? (
                        <ExpandLessRoundedIcon />
                      ) : (
                        <ExpandMoreRoundedIcon />
                      )}
                    </ListItemButton>

                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 1.25, pb: 0.5 }}>
                        {(d.topics || []).map((t) => (
                          <ListItemButton
                            key={`${d.domain}:${t.topic}`}
                            onClick={() => {
                              setActiveDomain(d.domain);
                              scrollToAnchor(makeAnchor(d.domain, t.topic));
                            }}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              py: 0.75,
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.08)",
                              },
                            }}
                          >
                            <ListItemText
                              primary={`${
                                t.label || getTopicLabel(d.domain, t.topic)
                              }`}
                              secondary={`${t.count} items`}
                              secondaryTypographyProps={{
                                sx: { opacity: 0.7 },
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
