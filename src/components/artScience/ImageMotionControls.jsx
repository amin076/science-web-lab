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
  BoxSelect,
  Camera,
  CircleDot,
  Clock,
  ImagePlus,
  Layers3,
  Pause,
  Play,
  RefreshCcw,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import {
  CAMERA_MOTION_PRESETS,
  IMAGE_MOTION_FORMATS,
  LIGHT_PRESETS,
  OBJECT_MOTION_PRESETS,
  OBJECT_TYPE_PRESETS,
  PARTICLE_PRESETS,
  SCENE_MODES,
  TARGET_DURATION_OPTIONS,
} from "./imageMotionPresets";

function FieldLabel({ children, value }) {
  return (
    <Box sx={{ mb: 0.8, display: "flex", justifyContent: "space-between", gap: 2 }}>
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
      {value !== undefined ? (
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

function Section({ icon, title, children }) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.15)",
        background: "rgba(15,23,42,0.56)",
        p: 1.6,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.4 }}>
        <Box sx={{ color: "#67e8f9", display: "grid", placeItems: "center" }}>
          {icon}
        </Box>
        <Typography sx={{ color: "white", fontWeight: 950, fontSize: 14 }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

function GlassSelect({ label, value, options, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel sx={{ color: "rgba(226,242,255,0.62)" }}>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={selectSx}
      >
        {Object.entries(options).map(([key, option]) => (
          <MenuItem key={key} value={key}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function ImageMotionControls({
  slides,
  selectedSlide,
  format,
  targetDuration,
  showCaptions,
  isPlaying,
  isRecording,
  onUpload,
  onObjectUpload,
  onFormatChange,
  onTargetDurationChange,
  onFitSlides,
  onShowCaptionsChange,
  onSlideUpdate,
  onTogglePlay,
  onRestart,
  onRecord,
}) {
  const particleSettings = selectedSlide?.particleSettings || PARTICLE_PRESETS.ringDebris;
  const lightSettings = selectedSlide?.lightSettings || LIGHT_PRESETS.cinematicGlow;

  const updateSelectedSlide = (patch) => {
    if (!selectedSlide) return;
    onSlideUpdate(selectedSlide.id, patch);
  };

  const updateParticlePreset = (presetKey) => {
    updateSelectedSlide({
      particlePreset: presetKey,
      particleSettings: { ...PARTICLE_PRESETS[presetKey] },
    });
  };

  const updateLightPreset = (presetKey) => {
    updateSelectedSlide({
      lightPreset: presetKey,
      lightSettings: { ...LIGHT_PRESETS[presetKey] },
    });
  };

  const updateObjectPreset = (presetKey) => {
    const preset = OBJECT_TYPE_PRESETS[presetKey];
    updateSelectedSlide({
      objectPreset: presetKey,
      objectMotion: preset.objectMotion,
      objectScale: preset.scale,
    });
  };

  const updateParticleValue = (key, value) => {
    updateSelectedSlide({
      particleSettings: {
        ...particleSettings,
        [key]: value,
      },
    });
  };

  const updateLightValue = (key, value) => {
    updateSelectedSlide({
      lightSettings: {
        ...lightSettings,
        [key]: value,
      },
    });
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 950, color: "white" }}>
          Science Scene Animator
        </Typography>
        <Typography sx={{ mt: 0.6, color: "rgba(226,242,255,0.62)" }}>
          Build pseudo-3D science scenes with camera depth, particles, objects,
          and recorder-ready canvas output.
        </Typography>
      </Box>

      <Button
        component="label"
        startIcon={<Upload size={18} />}
        variant="contained"
        sx={primaryButtonSx}
      >
        Upload Background Images
        <input
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => onUpload(event.target.files)}
        />
      </Button>

      <Section icon={<Clock size={17} />} title="Project Timing">
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 0.8,
            }}
          >
            {TARGET_DURATION_OPTIONS.map((value) => (
              <Button
                key={value}
                onClick={() => onTargetDurationChange(value)}
                variant={targetDuration === value ? "contained" : "outlined"}
                sx={smallButtonSx}
              >
                {value}s
              </Button>
            ))}
          </Box>
          <FieldLabel value={`${targetDuration.toFixed(0)}s`}>
            Target duration
          </FieldLabel>
          <Slider
            value={targetDuration}
            min={5}
            max={180}
            step={5}
            onChange={(_, value) => onTargetDurationChange(value)}
          />
          <Button
            onClick={onFitSlides}
            disabled={!slides.length}
            variant="outlined"
            sx={outlineButtonSx}
          >
            Fit slides to target duration
          </Button>
        </Stack>
      </Section>

      <Section icon={<BoxSelect size={17} />} title="Output">
        <Stack spacing={1.5}>
          <GlassSelect
            label="Aspect Ratio"
            value={format}
            options={IMAGE_MOTION_FORMATS}
            onChange={onFormatChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showCaptions}
                onChange={(event) => onShowCaptionsChange(event.target.checked)}
              />
            }
            label="Render captions inside canvas"
            sx={{ color: "rgba(226,242,255,0.78)" }}
          />
        </Stack>
      </Section>

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
          sx={outlineButtonSx}
        >
          {isPlaying ? "Pause" : "Preview"}
        </Button>
        <Button
          onClick={onRestart}
          startIcon={<RefreshCcw size={17} />}
          variant="outlined"
          sx={outlineButtonSx}
        >
          Restart
        </Button>
      </Box>

      <Button
        onClick={onRecord}
        startIcon={<Video size={17} />}
        variant="contained"
        color={isRecording ? "error" : "primary"}
        sx={{ minHeight: 46, borderRadius: 3, fontWeight: 950 }}
      >
        {isRecording ? "Stop Recording" : "Record Scene Canvas"}
      </Button>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {selectedSlide ? (
        <>
          <Section icon={<Layers3 size={17} />} title="Selected Scene">
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Caption"
                value={selectedSlide.caption}
                onChange={(event) => updateSelectedSlide({ caption: event.target.value })}
                sx={textFieldSx}
              />
              <GlassSelect
                label="Scene Mode"
                value={selectedSlide.sceneMode}
                options={SCENE_MODES}
                onChange={(value) => updateSelectedSlide({ sceneMode: value })}
              />
              <GlassSelect
                label="Camera Motion"
                value={selectedSlide.cameraMotion}
                options={CAMERA_MOTION_PRESETS}
                onChange={(value) => updateSelectedSlide({ cameraMotion: value })}
              />
            </Stack>
          </Section>

          <Section icon={<ImagePlus size={17} />} title="Foreground Object (Optional)">
            <Stack spacing={1.5}>
              <Typography sx={{ color: "rgba(226,242,255,0.62)", fontSize: 12, lineHeight: 1.55 }}>
                Add a transparent PNG only when you want a separate moving subject, such as a spacecraft, astronaut, planet, or ball. The background image itself is not an object layer.
              </Typography>
              <Button component="label" variant="outlined" sx={outlineButtonSx}>
                {selectedSlide.objectUrl ? "Replace foreground object" : "Upload foreground object PNG"}
                <input
                  hidden
                  type="file"
                  accept="image/png,image/*"
                  onChange={(event) => onObjectUpload(selectedSlide.id, event.target.files?.[0])}
                />
              </Button>
              {selectedSlide.objectUrl ? (
                <Typography sx={{ color: "#67e8f9", fontSize: 12, fontWeight: 850 }}>
                  Loaded: {selectedSlide.objectFileName || "Uploaded image"}
                </Typography>
              ) : (
                <Typography sx={{ color: "rgba(226,242,255,0.48)", fontSize: 12 }}>
                  No foreground object is currently loaded.
                </Typography>
              )}
              <GlassSelect
                label="Object Type"
                value={selectedSlide.objectPreset}
                options={OBJECT_TYPE_PRESETS}
                onChange={updateObjectPreset}
              />
              <GlassSelect
                label="Object Motion"
                value={selectedSlide.objectMotion}
                options={OBJECT_MOTION_PRESETS}
                onChange={(value) => updateSelectedSlide({ objectMotion: value })}
              />
              <FieldLabel value={`${selectedSlide.objectScale.toFixed(2)}x`}>
                Object size
              </FieldLabel>
              <Slider
                value={selectedSlide.objectScale}
                min={0.15}
                max={2}
                step={0.05}
                onChange={(_, value) => updateSelectedSlide({ objectScale: value })}
              />
            </Stack>
          </Section>

          <Section icon={<CircleDot size={17} />} title="Particles">
            <Stack spacing={1.5}>
              <GlassSelect
                label="Particle Preset"
                value={selectedSlide.particlePreset}
                options={PARTICLE_PRESETS}
                onChange={updateParticlePreset}
              />
              <FieldLabel value={Math.round(particleSettings.count)}>
                Particle count
              </FieldLabel>
              <Slider
                value={particleSettings.count}
                min={0}
                max={700}
                step={10}
                onChange={(_, value) => updateParticleValue("count", value)}
              />
              <FieldLabel value={particleSettings.speed.toFixed(2)}>
                Particle speed
              </FieldLabel>
              <Slider
                value={particleSettings.speed}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, value) => updateParticleValue("speed", value)}
              />
              <FieldLabel value={particleSettings.opacity.toFixed(2)}>
                Particle opacity
              </FieldLabel>
              <Slider
                value={particleSettings.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, value) => updateParticleValue("opacity", value)}
              />
              <FieldLabel value={particleSettings.depth.toFixed(2)}>
                Particle depth
              </FieldLabel>
              <Slider
                value={particleSettings.depth}
                min={0.1}
                max={2}
                step={0.01}
                onChange={(_, value) => updateParticleValue("depth", value)}
              />
            </Stack>
          </Section>

          <Section icon={<Sparkles size={17} />} title="Light Effects">
            <Stack spacing={1.5}>
              <GlassSelect
                label="Light Preset"
                value={selectedSlide.lightPreset}
                options={LIGHT_PRESETS}
                onChange={updateLightPreset}
              />
              <FieldLabel value={lightSettings.glow.toFixed(2)}>Glow</FieldLabel>
              <Slider
                value={lightSettings.glow}
                min={0}
                max={1.5}
                step={0.01}
                onChange={(_, value) => updateLightValue("glow", value)}
              />
              <FieldLabel value={lightSettings.rays.toFixed(2)}>Rays</FieldLabel>
              <Slider
                value={lightSettings.rays}
                min={0}
                max={1.2}
                step={0.01}
                onChange={(_, value) => updateLightValue("rays", value)}
              />
              <FieldLabel value={lightSettings.vignette.toFixed(2)}>
                Vignette
              </FieldLabel>
              <Slider
                value={lightSettings.vignette}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, value) => updateLightValue("vignette", value)}
              />
            </Stack>
          </Section>
        </>
      ) : (
        <Box
          sx={{
            borderRadius: 4,
            border: "1px dashed rgba(103,232,249,0.32)",
            p: 2,
            color: "rgba(226,242,255,0.62)",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Camera size={17} color="#67e8f9" />
            <Typography sx={{ fontSize: 13 }}>
              Upload 5-8 images to begin building depth scenes.
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

const selectSx = {
  color: "white",
  borderRadius: 2.5,
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.16)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(103,232,249,0.38)",
  },
};

const textFieldSx = {
  input: { color: "white" },
  label: { color: "rgba(226,242,255,0.58)" },
  ".MuiOutlinedInput-root": { borderRadius: 2.5 },
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.14)",
  },
};

const primaryButtonSx = {
  minHeight: 46,
  borderRadius: 3,
  color: "#03111f",
  fontWeight: 950,
  background:
    "linear-gradient(135deg, rgba(103,232,249,1), rgba(167,139,250,0.95))",
};

const outlineButtonSx = {
  minHeight: 44,
  borderRadius: 3,
  borderColor: "rgba(103,232,249,0.28)",
  color: "white",
  fontWeight: 900,
};

const smallButtonSx = {
  minHeight: 34,
  borderRadius: 2.2,
  borderColor: "rgba(103,232,249,0.28)",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
};
