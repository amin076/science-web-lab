import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  ImagePlus,
  Pause,
  Play,
  RefreshCcw,
  Upload,
  Video,
} from "lucide-react";
import {
  IMAGE_MOTION_FORMATS,
  IMAGE_MOTION_PRESETS,
} from "./imageMotionPresets";

function FieldLabel({ children, value }) {
  return (
    <Box sx={{ mb: 0.8, display: "flex", justifyContent: "space-between" }}>
      <Typography
        component="span"
        sx={{
          color: "rgba(226,242,255,0.58)",
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Typography>
      {value ? (
        <Typography
          component="span"
          sx={{ color: "#67e8f9", fontSize: 11, fontWeight: 900 }}
        >
          {value}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function ImageMotionControls({
  slides,
  format,
  presetKey,
  secondsPerImage,
  showCaptions,
  isPlaying,
  isRecording,
  onUpload,
  onFormatChange,
  onPresetChange,
  onSecondsChange,
  onShowCaptionsChange,
  onCaptionChange,
  onTogglePlay,
  onRestart,
  onRecord,
}) {
  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 950, color: "white" }}>
          Image Motion Studio
        </Typography>
        <Typography sx={{ mt: 0.6, color: "rgba(226,242,255,0.62)" }}>
          Build cinematic science-media shorts from uploaded images.
        </Typography>
      </Box>

      <Button
        component="label"
        startIcon={<Upload size={18} />}
        variant="contained"
        sx={{
          minHeight: 46,
          borderRadius: 3,
          color: "#03111f",
          fontWeight: 950,
          background:
            "linear-gradient(135deg, rgba(103,232,249,1), rgba(168,85,247,0.92))",
        }}
      >
        Upload Images
        <input
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => onUpload(event.target.files)}
        />
      </Button>

      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.055)",
          p: 2,
        }}
      >
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "rgba(226,242,255,0.62)" }}>
              Format
            </InputLabel>
            <Select
              label="Format"
              value={format}
              onChange={(event) => onFormatChange(event.target.value)}
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              {Object.entries(IMAGE_MOTION_FORMATS).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "rgba(226,242,255,0.62)" }}>
              Motion Preset
            </InputLabel>
            <Select
              label="Motion Preset"
              value={presetKey}
              onChange={(event) => onPresetChange(event.target.value)}
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              {Object.entries(IMAGE_MOTION_PRESETS).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <FieldLabel value={`${secondsPerImage.toFixed(1)}s`}>
              Seconds per image
            </FieldLabel>
            <Slider
              value={secondsPerImage}
              min={2}
              max={10}
              step={0.5}
              onChange={(_, value) => onSecondsChange(value)}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showCaptions}
                onChange={(event) => onShowCaptionsChange(event.target.checked)}
              />
            }
            label="Show captions"
            sx={{ color: "rgba(226,242,255,0.78)" }}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
        }}
      >
        <Button
          onClick={onTogglePlay}
          startIcon={isPlaying ? <Pause size={17} /> : <Play size={17} />}
          variant="outlined"
          sx={{
            minHeight: 44,
            borderRadius: 3,
            borderColor: "rgba(103,232,249,0.28)",
            color: "white",
            fontWeight: 900,
          }}
        >
          {isPlaying ? "Pause" : "Preview"}
        </Button>
        <Button
          onClick={onRestart}
          startIcon={<RefreshCcw size={17} />}
          variant="outlined"
          sx={{
            minHeight: 44,
            borderRadius: 3,
            borderColor: "rgba(255,255,255,0.16)",
            color: "white",
            fontWeight: 900,
          }}
        >
          Restart
        </Button>
      </Box>

      <Button
        onClick={onRecord}
        startIcon={<Video size={17} />}
        variant="contained"
        color={isRecording ? "error" : "primary"}
        sx={{
          minHeight: 46,
          borderRadius: 3,
          fontWeight: 950,
        }}
      >
        {isRecording ? "Stop Recording" : "Record Canvas"}
      </Button>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
          <ImagePlus size={16} color="#67e8f9" />
          <Typography sx={{ color: "white", fontWeight: 900 }}>
            Slides
          </Typography>
          <Typography sx={{ color: "rgba(226,242,255,0.52)", fontSize: 13 }}>
            {slides.length}/8
          </Typography>
        </Stack>

        <Stack spacing={1.2}>
          {slides.length ? (
            slides.map((slide, index) => (
              <Box
                key={slide.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "54px 1fr",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={slide.fileUrl}
                  alt=""
                  sx={{
                    width: 54,
                    height: 70,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                />
                <TextField
                  size="small"
                  label={`Caption ${index + 1}`}
                  value={slide.caption}
                  onChange={(event) => onCaptionChange(slide.id, event.target.value)}
                  sx={{
                    input: { color: "white" },
                    label: { color: "rgba(226,242,255,0.58)" },
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.14)",
                    },
                  }}
                />
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "rgba(226,242,255,0.54)", fontSize: 13 }}>
              Upload 5-8 images for best results. The preview still works with fewer.
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
