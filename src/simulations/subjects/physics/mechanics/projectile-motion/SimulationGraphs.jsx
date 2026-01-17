// src/simulations/subjects/physics/mechanics/projectile-motion/SimulationGraphs.jsx
import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Typography, Tabs, Tab, Button, Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShowChartIcon from "@mui/icons-material/ShowChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GraphSection = ({ data, onClear }) => {
  // Tabs: 0: PosX, 1: PosY, 2: Vx, 3: Vy, 4: KE, 5: PE
  const [activeTab, setActiveTab] = useState(0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#adb5bd",
          font: { family: "Inter, sans-serif", size: 11 },
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#4ECDC4",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.02)" },
        ticks: {
          color: "#64748b",
          font: { size: 10, family: "monospace" },
          maxTicksLimit: 12,
        },
        title: {
          display: true,
          text: "TIME (s)",
          color: "#475569",
          font: { size: 10, weight: "bold" },
        },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)", borderDash: [5, 5] },
        ticks: { color: "#64748b", font: { size: 10, family: "monospace" } },
        border: { display: false },
      },
    },
  };

  const chartData = useMemo(() => {
    // Sampling for performance
    const displayData =
      data.length > 300 ? data.filter((_, i) => i % 2 === 0) : data;
    const labels = displayData.map((d) => d.time.toFixed(1));

    const style = (color, fade) => ({
      borderColor: color,
      backgroundColor: fade || "transparent",
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2,
      tension: 0.4,
      fill: !!fade,
    });

    let datasets = [];

    switch (activeTab) {
      case 0: // POSITION X
        datasets = [
          {
            label: "Ball X",
            data: displayData.map((d) => d.ball_x),
            ...style("#00F0FF", null),
          },
          {
            label: "Car X",
            data: displayData.map((d) => d.car_x),
            ...style("#FF2E63", null),
          },
          {
            label: "Plane X",
            data: displayData.map((d) => d.plane_x),
            ...style("#3498db", null),
          },
          {
            label: "Parcel X",
            data: displayData.map((d) => d.parcel_x),
            ...style("#e67e22", null),
          },
        ];
        break;

      case 1: // POSITION Y
        datasets = [
          {
            label: "Ball Y",
            data: displayData.map((d) => d.ball_y),
            ...style("#00F0FF", "rgba(0, 240, 255, 0.1)"),
          },
          {
            label: "Plane Y",
            data: displayData.map((d) => d.plane_y),
            ...style("#3498db", "rgba(52, 152, 219, 0.05)"),
          },
          {
            label: "Parcel Y",
            data: displayData.map((d) => d.parcel_y),
            ...style("#e67e22", null),
          },
        ];
        break;

      case 2: // VELOCITY X
        datasets = [
          {
            label: "Ball Vx",
            data: displayData.map((d) => d.ball_vx),
            ...style("#00F0FF", null),
          },
          {
            label: "Car Vx",
            data: displayData.map((d) => d.car_vx),
            ...style("#FF2E63", null),
          },
          {
            label: "Plane Vx",
            data: displayData.map((d) => d.plane_vx),
            ...style("#3498db", null),
          },
          {
            label: "Parcel Vx",
            data: displayData.map((d) => d.parcel_vx),
            ...style("#e67e22", null),
          },
        ];
        break;

      case 3: // VELOCITY Y
        datasets = [
          {
            label: "Ball Vy",
            data: displayData.map((d) => d.ball_vy),
            ...style("#00F0FF", null),
          },
          {
            label: "Parcel Vy",
            data: displayData.map((d) => d.parcel_vy),
            ...style("#e67e22", null),
          },
        ];
        break;

      case 4: // KINETIC ENERGY (Ball & Parcel ONLY)
        datasets = [
          {
            label: "Ball KE",
            data: displayData.map((d) => d.ball_KE),
            ...style("#FFB74D", "rgba(255, 183, 77, 0.1)"), // Amber
          },
          {
            label: "Parcel KE",
            data: displayData.map((d) => d.parcel_KE),
            ...style("#e67e22", null), // Darker Orange
            borderDash: [5, 5],
          },
        ];
        break;

      case 5: // POTENTIAL ENERGY (Ball & Parcel ONLY)
        datasets = [
          {
            label: "Ball PE",
            data: displayData.map((d) => d.ball_PE),
            ...style("#69F0AE", "rgba(105, 240, 174, 0.1)"), // Emerald
          },
          {
            label: "Parcel PE",
            data: displayData.map((d) => d.parcel_PE),
            ...style("#00E676", null), // Darker Green
            borderDash: [5, 5],
          },
        ];
        break;

      default:
        break;
    }

    return { labels, datasets };
  }, [data, activeTab]);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 4,
        bgcolor: "#0b0c10", // Very dark card
        border: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          bgcolor: "rgba(255,255,255,0.01)",
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShowChartIcon sx={{ color: "#4ECDC4" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#e2e8f0", fontSize: 16 }}
            >
              DATA ANALYSIS
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            textColor="inherit"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: 13,
                minHeight: 36,
                color: "#64748b",
                fontWeight: 500,
                px: 2,
              },
              "& .Mui-selected": {
                color: "#4ECDC4 !important",
                fontWeight: 700,
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#4ECDC4",
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            <Tab label="Pos X" />
            <Tab label="Pos Y" />
            <Tab label="Vx" />
            <Tab label="Vy" />
            <Tab label="Kinetic E" />
            <Tab label="Potential E" />
          </Tabs>
        </Stack>

        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          onClick={onClear}
          sx={{
            borderColor: "rgba(255, 46, 99, 0.3)",
            color: "#FF2E63",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF2E63",
              bgcolor: "rgba(255, 46, 99, 0.1)",
            },
          }}
        >
          Clear Data
        </Button>
      </Box>

      {/* CHART CONTENT */}
      <Box sx={{ height: 400, p: 3, position: "relative" }}>
        {data.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.3,
            }}
          >
            <ShowChartIcon sx={{ fontSize: 60, mb: 2, color: "#4ECDC4" }} />
            <Typography variant="body2" color="white" fontFamily="monospace">
              START SIMULATION TO RECORD DATA
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GraphSection;