import {
  Box,
  Button,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Copy, Trash2 } from "lucide-react";

function formatTime(value) {
  return `${Number(value || 0).toFixed(1)}s`;
}

export default function SceneTimeline({
  slides,
  selectedSlideId,
  totalDuration,
  currentTime,
  onSelectSlide,
  onReorderSlides,
  onDurationChange,
  onDuplicateSlide,
  onDeleteSlide,
}) {
  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId);
  const remainingTime = Math.max(0, totalDuration - currentTime);

  const handleDrop = (event, targetId) => {
    const sourceId = event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    onReorderSlides(sourceId, targetId);
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(2,6,23,0.72)",
        p: { xs: 1.4, md: 1.8 },
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.4}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1.4 }}
      >
        <Box>
          <Typography sx={{ color: "white", fontWeight: 950 }}>
            Scene Timeline
          </Typography>
          <Typography sx={{ color: "rgba(226,242,255,0.54)", fontSize: 12 }}>
            Select, drag order, duplicate, delete, or resize the active scene.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Typography sx={metricSx}>
            Total <strong>{formatTime(totalDuration)}</strong>
          </Typography>
          <Typography sx={metricSx}>
            Now <strong>{formatTime(currentTime)}</strong>
          </Typography>
          <Typography sx={metricSx}>
            Left <strong>{formatTime(remainingTime)}</strong>
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.8,
          scrollbarWidth: "thin",
        }}
      >
        {slides.length ? (
          slides.map((slide, index) => {
            const selected = slide.id === selectedSlideId;
            return (
              <Button
                key={slide.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", slide.id);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, slide.id)}
                onClick={() => onSelectSlide(slide.id)}
                sx={{
                  flex: "0 0 auto",
                  minWidth: 86,
                  height: 78,
                  borderRadius: 3,
                  border: selected
                    ? "1px solid rgba(103,232,249,0.92)"
                    : "1px solid rgba(148,163,184,0.18)",
                  color: "white",
                  background: selected
                    ? "linear-gradient(145deg, rgba(8,145,178,0.32), rgba(168,85,247,0.2))"
                    : "rgba(15,23,42,0.78)",
                  boxShadow: selected
                    ? "0 0 28px rgba(34,211,238,0.24)"
                    : "none",
                  textAlign: "left",
                  p: 0.8,
                  alignItems: "stretch",
                  justifyContent: "stretch",
                }}
              >
                <Stack spacing={0.4} sx={{ width: "100%" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 950 }}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Box
                    component="img"
                    src={slide.backgroundUrl}
                    alt=""
                    sx={{
                      width: "100%",
                      height: 32,
                      borderRadius: 1.5,
                      objectFit: "cover",
                      opacity: 0.88,
                    }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(226,242,255,0.7)",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {formatTime(slide.duration)}
                  </Typography>
                </Stack>
              </Button>
            );
          })
        ) : (
          <Typography sx={{ color: "rgba(226,242,255,0.58)", fontSize: 13 }}>
            Upload background images to create scenes.
          </Typography>
        )}
      </Box>

      {selectedSlide ? (
        <Box
          sx={{
            mt: 1.6,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gap: 1.2,
            alignItems: "center",
          }}
        >
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.3 }}
            >
              <Typography
                sx={{
                  color: "rgba(226,242,255,0.64)",
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Selected duration
              </Typography>
              <Typography sx={{ color: "#67e8f9", fontSize: 12, fontWeight: 950 }}>
                {formatTime(selectedSlide.duration)}
              </Typography>
            </Stack>
            <Slider
              value={selectedSlide.duration}
              min={1}
              max={16}
              step={0.25}
              onChange={(_, value) => onDurationChange(selectedSlide.id, value)}
            />
          </Box>
          <Stack direction="row" spacing={0.8}>
            <Tooltip title="Duplicate scene">
              <IconButton
                onClick={() => onDuplicateSlide(selectedSlide.id)}
                sx={iconButtonSx}
              >
                <Copy size={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete scene">
              <IconButton
                onClick={() => onDeleteSlide(selectedSlide.id)}
                sx={iconButtonSx}
              >
                <Trash2 size={17} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

const metricSx = {
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.16)",
  color: "rgba(226,242,255,0.64)",
  background: "rgba(15,23,42,0.64)",
  px: 1.2,
  py: 0.55,
  fontSize: 11,
  fontWeight: 800,
  "& strong": {
    color: "#67e8f9",
    fontWeight: 950,
  },
};

const iconButtonSx = {
  width: 42,
  height: 42,
  borderRadius: 2.5,
  border: "1px solid rgba(148,163,184,0.2)",
  color: "white",
  background: "rgba(15,23,42,0.72)",
  "&:hover": {
    borderColor: "rgba(103,232,249,0.55)",
    background: "rgba(14,116,144,0.25)",
  },
};
