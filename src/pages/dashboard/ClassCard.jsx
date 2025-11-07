import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ classData, role = "teacher" }) {
  const navigate = useNavigate();
  const { id, name, description, createdAt } = classData;

  const formattedDate = createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString()
    : "Recently created";

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      sx={{
        borderRadius: 3, // ✅ consistent radius across dashboards
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        background:
          "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(51,65,85,0.9))", // ✅ dark glassy style
        backdropFilter: "blur(12px)",
        color: "white",
        minHeight: { xs: 220, sm: 250, md: 250 },
        maxHeight: 260,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 0 20px rgba(37,99,235,0.5)", // ✅ subtle blue glow
        },
      }}
      onClick={() => navigate(`/dashboard/class/${id}`)}
    >
      {/* 🔹 Top Section */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <SchoolRoundedIcon
            sx={{
              color: "#60a5fa",
              fontSize: 30,
              mr: 1,
            }}
          />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#f8fafc", lineHeight: 1.3 }}
          >
            {name}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.75)",
            mb: 2,
            minHeight: 45,
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description || "No description provided."}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.6)" }}
        >
          📅 {formattedDate}
        </Typography>
      </CardContent>

      {/* 🔹 Bottom Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          px: 2,
          pb: 2,
          pt: 1,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)", // ✅ soft transparent divider
        }}
      >
        <Button
          size="small"
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/class/${id}`);
          }}
          sx={{
            borderRadius: 2,
            px: 2.5,
            fontWeight: 600,
            textTransform: "none",
            background:
              role === "student"
                ? "linear-gradient(90deg,#22c55e,#16a34a)" // ✅ green for student
                : "linear-gradient(90deg,#3b82f6,#2563eb)", // ✅ blue for teacher
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          {role === "student" ? "Open" : "View Class"}
        </Button>
      </Box>
    </Card>
  );
}
