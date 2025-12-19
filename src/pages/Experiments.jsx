// ✅ src/pages/Experiments.jsx
import { Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { experimentsData } from "@/data/experiments";
import ExperimentCard from "@/components/experiments/ExperimentCard";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Experiments() {
  const navigate = useNavigate();
  const demoExperiments = experimentsData.filter((exp) => exp.demo);

  // ✅ Start باید مستقیم شبیه‌ساز رو اجرا کنه
  const handleStart = (id) => {
    navigate(`/experiments/${id}/run`);
  };

  // ✅ Details باید بره صفحه جزئیات
  const handleDetails = (id) => {
    navigate(`/experiments/${id}`);
  };

  return (
    <Box sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={700}
        sx={{
          textAlign: "center",
          mb: 1,
          background: "linear-gradient(90deg,#2563eb,#38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Physics Experiments
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 5, textAlign: "center" }}
      >
        Pick a domain to start exploring interactive labs.
      </Typography>

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        sx={{
          display: "grid",
          gap: 3,
          justifyContent: "center",
          gridTemplateColumns: { xs: "repeat(auto-fit, minmax(250px, 1fr))" },
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {demoExperiments.map((exp) => (
          <Box key={exp.id} component={motion.div} variants={itemVariants}>
            {/* ✅ مهم: ExperimentCard باید onDetails هم داشته باشه */}
            <ExperimentCard
              {...exp}
              onStart={() => handleStart(exp.id)}
              onDetails={() => handleDetails(exp.id)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
