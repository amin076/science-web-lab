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
import { Box, Paper, Typography, Tabs, Tab, Button } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Register ChartJS components
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
  const [activeTab, setActiveTab] = useState(0);

  // --- CHART CONFIGURATION ---
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Disable animation for performance during updates
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          font: { family: 'Consolas', size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        titleColor: '#4ECDC4',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
        title: { display: true, text: 'Time (s)', color: '#666' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
      },
    },
  };

  // Prepare datasets based on active tab
  const chartData = useMemo(() => {
    const labels = data.map(d => d.time.toFixed(1));
    let datasets = [];

    const commonStyle = {
      tension: 0.4, // Smooth curves
      pointRadius: 0, // Hide points for clean lines
      pointHoverRadius: 6,
      borderWidth: 2,
    };

    if (activeTab === 0) {
      // VELOCITY VIEW
      datasets = [
        {
          label: 'Ball Vx',
          data: data.map(d => d.ball_vx),
          borderColor: '#baf026', // Lime Green
          backgroundColor: 'rgba(186, 240, 38, 0.1)',
          fill: true,
          ...commonStyle
        },
        {
          label: 'Ball Vy',
          data: data.map(d => d.ball_vy),
          borderColor: '#8cb812', // Darker Lime
          borderDash: [5, 5],
          ...commonStyle
        },
        {
          label: 'Car Vx',
          data: data.map(d => d.car_vx),
          borderColor: '#4ECDC4', // Teal
          ...commonStyle
        },
      ];
    } else if (activeTab === 1) {
      // POSITION VIEW
      datasets = [
        {
          label: 'Ball Height (Y)',
          data: data.map(d => d.ball_y),
          borderColor: '#ff9800', // Orange
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          ...commonStyle
        },
        {
          label: 'Ball Distance (X)',
          data: data.map(d => d.ball_x), // We need to ensure we pass ball_x
          borderColor: '#ffcc80', // Light Orange
          borderDash: [5, 5],
          ...commonStyle
        },
        {
          label: 'Car Position (X)',
          data: data.map(d => d.car_x),
          borderColor: '#4ECDC4', // Teal
          ...commonStyle
        },
      ];
    } else if (activeTab === 2) {
      // ENERGY VIEW
      datasets = [
        {
          label: 'Kinetic Energy (KE)',
          data: data.map(d => d.ball_KE),
          borderColor: '#f44336', // Red
          ...commonStyle
        },
        {
          label: 'Potential Energy (PE)',
          data: data.map(d => d.ball_PE),
          borderColor: '#2196f3', // Blue
          ...commonStyle
        },
        {
          label: 'Total Mechanical Energy',
          data: data.map(d => d.ball_ME),
          borderColor: '#ffffff', // White
          borderDash: [2, 2],
          borderWidth: 1,
          ...commonStyle
        },
      ];
    }

    return { labels, datasets };
  }, [data, activeTab]);

  return (
    <Box sx={{ width: "100%", mt: 2, pb: 10, px: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
          Data Analysis
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteOutlineIcon />}
          onClick={onClear}
          size="small"
        >
          Clear Data
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 0,
          bgcolor: "rgba(20, 20, 35, 0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 4,
          overflow: "hidden"
        }}
      >
        {/* TABS HEADER */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', bgcolor: "rgba(0,0,0,0.2)" }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ 
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' },
              '& .Mui-selected': { color: '#4ECDC4' } 
            }}
          >
            <Tab label="Velocity (m/s)" />
            <Tab label="Position (m)" />
            <Tab label="Energy (J)" />
          </Tabs>
        </Box>

        {/* CHART BODY */}
        <Box sx={{ height: 500, p: 3 }}>
          {data.length > 0 ? (
            <Line options={options} data={chartData} />
          ) : (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography color="rgba(255,255,255,0.3)">
                Start the simulation to record data...
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default GraphSection;