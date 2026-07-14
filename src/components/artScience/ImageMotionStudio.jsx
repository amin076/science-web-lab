import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layers3, Sparkles } from "lucide-react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";
import ImageMotionCanvas from "./ImageMotionCanvas";
import ImageMotionControls from "./ImageMotionControls";
import SceneTimeline from "./SceneTimeline";
import {
  CAMERA_MOTION_PRESETS,
  DEFAULT_SCENE_SETTINGS,
  IMAGE_MOTION_FORMATS,
  LIGHT_PRESETS,
  OBJECT_TYPE_PRESETS,
  PARTICLE_PRESETS,
  SCENE_MODES,
} from "./imageMotionPresets";

const CAMERA_SEQUENCE = Object.keys(CAMERA_MOTION_PRESETS);
const PARTICLE_SEQUENCE = Object.keys(PARTICLE_PRESETS);
const LIGHT_SEQUENCE = Object.keys(LIGHT_PRESETS).filter((key) => key !== "none");
const SCENE_SEQUENCE = Object.keys(SCENE_MODES).filter((key) => key !== "flat");

function makeId(prefix = "scene") {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`
  );
}

function cleanCaption(fileName) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function createSceneSlide(file, index, duration) {
  const particlePreset = PARTICLE_SEQUENCE[index % PARTICLE_SEQUENCE.length];
  const lightPreset = LIGHT_SEQUENCE[index % LIGHT_SEQUENCE.length];
  const sceneMode =
    index === 0 ? DEFAULT_SCENE_SETTINGS.sceneMode : SCENE_SEQUENCE[index % SCENE_SEQUENCE.length];
  const objectPreset = "custom";

  return {
    id: `${file.name}-${file.lastModified}-${index}-${makeId("slide")}`,
    backgroundUrl: URL.createObjectURL(file),
    objectUrl: "",
    caption: cleanCaption(file.name),
    duration,
    sceneMode,
    cameraMotion: CAMERA_SEQUENCE[index % CAMERA_SEQUENCE.length],
    particlePreset,
    particleSettings: { ...PARTICLE_PRESETS[particlePreset] },
    lightPreset,
    lightSettings: { ...LIGHT_PRESETS[lightPreset] },
    objectPreset,
    objectMotion: OBJECT_TYPE_PRESETS[objectPreset].objectMotion,
    objectScale: OBJECT_TYPE_PRESETS[objectPreset].scale,
  };
}

function getPreviewMaxWidth(format) {
  if (format === "shorts") return 430;
  if (format === "square") return 680;
  return 1040;
}

export default function ImageMotionStudio() {
  const landscapeRecorderRef = useRef(null);
  const shortsRecorderRef = useRef(null);
  const squareRecorderRef = useRef(null);
  const assetUrlsRef = useRef(new Set());
  const [slides, setSlides] = useState([]);
  const [selectedSlideId, setSelectedSlideId] = useState("");
  const [format, setFormat] = useState("shorts");
  const [targetDuration, setTargetDuration] = useState(30);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const output = IMAGE_MOTION_FORMATS[format] || IMAGE_MOTION_FORMATS.shorts;

  const selectedSlide = useMemo(
    () => slides.find((slide) => slide.id === selectedSlideId) || slides[0] || null,
    [selectedSlideId, slides],
  );

  const totalDuration = useMemo(
    () => slides.reduce((sum, slide) => sum + Math.max(0.25, slide.duration || 0), 0),
    [slides],
  );

  const registerAssets = useCallback((nextSlides) => {
    nextSlides.forEach((slide) => {
      if (slide.backgroundUrl) assetUrlsRef.current.add(slide.backgroundUrl);
      if (slide.objectUrl) assetUrlsRef.current.add(slide.objectUrl);
    });
  }, []);

  const revokeAllAssets = useCallback(() => {
    assetUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    assetUrlsRef.current.clear();
  }, []);

  const handleUpload = useCallback(
    (fileList) => {
      const files = Array.from(fileList || [])
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 10);

      if (!files.length) return;

      revokeAllAssets();
      const duration = targetDuration / files.length;
      const nextSlides = files.map((file, index) =>
        createSceneSlide(file, index, duration),
      );
      registerAssets(nextSlides);
      setSlides(nextSlides);
      setSelectedSlideId(nextSlides[0]?.id || "");
      setCurrentTime(0);
      setIsPlaying(true);
      setRestartKey((value) => value + 1);
    },
    [registerAssets, revokeAllAssets, targetDuration],
  );

  const handleObjectUpload = useCallback((slideId, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    assetUrlsRef.current.add(objectUrl);

    setSlides((current) =>
      current.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              objectUrl,
              objectPreset: slide.objectPreset || "custom",
              objectFileName: file.name,
            }
          : slide,
      ),
    );
  }, []);

  const handleSlideUpdate = useCallback((slideId, patch) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === slideId ? { ...slide, ...patch } : slide)),
    );
  }, []);

  const handleFitSlides = useCallback(() => {
    setSlides((current) => {
      if (!current.length) return current;
      const duration = targetDuration / current.length;
      return current.map((slide) => ({ ...slide, duration }));
    });
    setRestartKey((value) => value + 1);
    setCurrentTime(0);
  }, [targetDuration]);

  const handleDurationChange = useCallback((slideId, duration) => {
    handleSlideUpdate(slideId, { duration: Number(duration) });
  }, [handleSlideUpdate]);

  const handleReorderSlides = useCallback((sourceId, targetId) => {
    setSlides((current) => {
      const sourceIndex = current.findIndex((slide) => slide.id === sourceId);
      const targetIndex = current.findIndex((slide) => slide.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setRestartKey((value) => value + 1);
    setCurrentTime(0);
  }, []);

  const handleDuplicateSlide = useCallback((slideId) => {
    setSlides((current) => {
      const sourceIndex = current.findIndex((slide) => slide.id === slideId);
      if (sourceIndex < 0) return current;
      const source = current[sourceIndex];
      const copy = {
        ...source,
        id: `${source.id}-copy-${makeId("copy")}`,
        caption: `${source.caption} copy`,
      };
      const next = [...current];
      next.splice(sourceIndex + 1, 0, copy);
      return next;
    });
  }, []);

  const handleDeleteSlide = useCallback((slideId) => {
    setSlides((current) => {
      const next = current.filter((slide) => slide.id !== slideId);
      if (selectedSlideId === slideId) {
        setSelectedSlideId(next[0]?.id || "");
      }
      return next;
    });
    setRestartKey((value) => value + 1);
    setCurrentTime(0);
  }, [selectedSlideId]);

  const handleRestart = useCallback(() => {
    setRestartKey((value) => value + 1);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const handleRecord = useCallback(() => {
    const recorder =
      format === "landscape"
        ? landscapeRecorderRef.current
        : format === "square"
          ? squareRecorderRef.current
          : shortsRecorderRef.current;

    if (isRecording) {
      recorder?.stopRecording?.();
      return;
    }

    setIsPlaying(true);
    recorder?.startRecording?.();
  }, [format, isRecording]);

  useEffect(() => () => revokeAllAssets(), [revokeAllAssets]);

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 88px)",
        background:
          "radial-gradient(circle at 18% 10%, rgba(34,211,238,0.16), transparent 29%), radial-gradient(circle at 88% 4%, rgba(244,114,182,0.18), transparent 28%), linear-gradient(145deg, #020617, #080b18 52%, #030712)",
        color: "white",
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  color: "#67e8f9",
                  border: "1px solid rgba(103,232,249,0.28)",
                  background: "rgba(103,232,249,0.1)",
                  boxShadow: "0 0 34px rgba(103,232,249,0.18)",
                }}
              >
                <Layers3 size={23} />
              </Box>
              <Box>
                <Typography
                  component="div"
                  sx={{
                    color: "#67e8f9",
                    fontSize: 12,
                    fontWeight: 950,
                    textTransform: "uppercase",
                  }}
                >
                  Esbiko Creative Studio
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 950,
                    letterSpacing: 0,
                    lineHeight: 1.02,
                    fontSize: { xs: 31, md: 46 },
                  }}
                >
                  AI / Depth Scene Animator
                </Typography>
              </Box>
            </Stack>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                borderRadius: 999,
                border: "1px solid rgba(103,232,249,0.22)",
                background: "rgba(15,23,42,0.68)",
                px: 1.5,
                py: 1,
                color: "rgba(226,242,255,0.72)",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <Sparkles size={16} color="#67e8f9" />
              Layered scenes, not slideshow zooms
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0,1fr) 420px" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  minWidth: 0,
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.11)",
                  background: "rgba(255,255,255,0.045)",
                  p: { xs: 1.2, md: 2 },
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 30px 120px rgba(0,0,0,0.38)",
                }}
              >
                <Box
                  sx={{
                    mx: "auto",
                    width: "100%",
                    maxWidth: getPreviewMaxWidth(format),
                    aspectRatio: `${output.width} / ${output.height}`,
                  }}
                >
                  <ImageMotionCanvas
                    slides={slides}
                    format={format}
                    isPlaying={isPlaying}
                    showCaptions={showCaptions}
                    restartKey={restartKey}
                    onTimeUpdate={setCurrentTime}
                  />
                </Box>
                <Typography
                  sx={{
                    mt: 1.4,
                    color: "rgba(226,242,255,0.56)",
                    textAlign: "center",
                    fontSize: 13,
                  }}
                >
                  {slides.length
                    ? `${slides.length} layered scenes - ${totalDuration.toFixed(1)} seconds - ${output.label}`
                    : "Canvas is ready for background images, object PNGs, particles, and recording."}
                </Typography>
              </Box>

              <SceneTimeline
                slides={slides}
                selectedSlideId={selectedSlide?.id || ""}
                totalDuration={totalDuration}
                currentTime={currentTime}
                onSelectSlide={setSelectedSlideId}
                onReorderSlides={handleReorderSlides}
                onDurationChange={handleDurationChange}
                onDuplicateSlide={handleDuplicateSlide}
                onDeleteSlide={handleDeleteSlide}
              />
            </Stack>

            <Box
              sx={{
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(5,10,24,0.72)",
                p: 2.2,
                backdropFilter: "blur(24px)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.36)",
              }}
            >
              <ImageMotionControls
                slides={slides}
                selectedSlide={selectedSlide}
                format={format}
                targetDuration={targetDuration}
                showCaptions={showCaptions}
                isPlaying={isPlaying}
                isRecording={isRecording}
                onUpload={handleUpload}
                onObjectUpload={handleObjectUpload}
                onFormatChange={setFormat}
                onTargetDurationChange={setTargetDuration}
                onFitSlides={handleFitSlides}
                onShowCaptionsChange={setShowCaptions}
                onSlideUpdate={handleSlideUpdate}
                onTogglePlay={() => setIsPlaying((value) => !value)}
                onRestart={handleRestart}
                onRecord={handleRecord}
              />
            </Box>
          </Box>
        </Stack>
      </Container>

      <VideoRecorderControls
        ref={shortsRecorderRef}
        canvasSelector=".image-motion-canvas"
        outputMode="shorts"
        fileName={`esbiko-scene-animator-shorts-${Date.now()}.webm`}
        fps={60}
        videoBitsPerSecond={65000000}
        codecMode="realtime-quality"
        showButton={false}
        onRecordingChange={setIsRecording}
      />
      <VideoRecorderControls
        ref={landscapeRecorderRef}
        canvasSelector=".image-motion-canvas"
        outputMode="landscape"
        fileName={`esbiko-scene-animator-landscape-${Date.now()}.webm`}
        fps={60}
        videoBitsPerSecond={85000000}
        codecMode="realtime-quality"
        showButton={false}
        onRecordingChange={setIsRecording}
      />
      <VideoRecorderControls
        ref={squareRecorderRef}
        canvasSelector=".image-motion-canvas"
        outputMode="square"
        fileName={`esbiko-scene-animator-square-${Date.now()}.webm`}
        fps={60}
        videoBitsPerSecond={70000000}
        codecMode="realtime-quality"
        showButton={false}
        onRecordingChange={setIsRecording}
      />
    </Box>
  );
}
