// ✅ src/components/layout/EqualHeightGrid.jsx
import { Grid } from "@mui/material";

export default function EqualHeightGrid({ children, spacing = 3 }) {
  return (
    <Grid
      container
      spacing={spacing}
      justifyContent="center"
      alignItems="stretch"
      sx={{
        "& > .MuiGrid-item": {
          display: "flex",
          justifyContent: "center",
        },
      }}
    >
      {children}
    </Grid>
  );
}
