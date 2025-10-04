// src/components/experiments/ExperimentCard.jsx
import { Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * ExperimentCard Component
 * Props:
 *  - id (string): experiment id (e.g. "mechanics")
 *  - name (string): experiment name
 *  - desc (string): short description
 *  - Icon (React component): icon for the experiment
 *  - gradient (string): background gradient style
 */
export default function ExperimentCard({ id, name, desc, Icon, gradient }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: 4,
        overflow: "hidden",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
      }}
    >
      <Box sx={{ p: 2, color: "white", background: gradient }}>
        <Icon sx={{ fontSize: 42 }} />
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="contained"
          component={Link}
          to={`/experiments/${id}`}
        >
          Start
        </Button>
        <Button
          size="small"
          variant="text"
          component={Link}
          to={`/experiments/${id}`}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
}
