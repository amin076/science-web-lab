import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";
import ImageMotionCanvas from "./ImageMotionCanvas";
import ImageMotionControls from "./ImageMotionControls";
import {
  IMAGE_MOTION_FORMATS,
  IMAGE_MOTION_PRESETS,
} from "./imageMotionPresets";

function createSlide(file, index, duration, preset) {
  const randomId =
    globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  return {
    id: `${file.name}-${file.lastModified}-${index}-${randomId}`,
    fileUrl: URL.createObjectURL(file),
    caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    duration,
    motion: { ...preset },
  };
}

export default function ImageMotionStudio() {
  const landscapeRecorderRef = useRef(null);
  const shortsRecorderRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const [slides, setSlides] = useState([]);
  const [format, setFormat] = useState("shorts");
  const [presetKey, setPresetKey] = useState("cosmicZoom");
  const [secondsPerImage, setSecondsPerImage] = useState(4);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const output = IMAGE_MOTION_FORMATS[format] || IMAGE_MOTION_FORMATS.shorts;

  const totalDuration = useMemo(
    () => slides.reduce((sum, slide) => sum + (slide.duration || secondsPerImage), 0),
    [secondsPerImage, slides],
  );

  const handleUpload = useCallback(
    (fileList) => {
      const files = Array.from(fileList || [])
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 8);

      if (!files.length) return;

      const preset = IMAGE_MOTION_PRESETS[presetKey] || IMAGE_MOTION_PRESETS.cosmicZoom;
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      const nextSlides = files.map((file, index) =>
        createSlide(file, index, secondsPerImage, preset),
      );
      objectUrlsRef.current = nextSlides.map((slide) => slide.fileUrl);
      setSlides(nextSlides);
      setIsPlaying(true);
      setRestartKey((value) => value + 1);
    },
    [presetKey, secondsPerImage],
  );

  const handlePresetChange = useCallback((value) => {
    const preset = IMAGE_MOTION_PRESETS[value] || IMAGE_MOTION_PRESETS.cosmicZoom;
    setPresetKey(value);
    setSlides((current) =>
      current.map((slide) => ({
        ...slide,
        motion: { ...preset },
      })),
    );
  }, []);

  const handleSecondsChange = useCallback((value) => {
    const duration = Number(value);
    setSecondsPerImage(duration);
    setSlides((current) =>
      current.map((slide) => ({
        ...slide,
        duration,
      })),
    );
  }, []);

  const handleCaptionChange = useCallback((id, caption) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, caption } : slide)),
    );
  }, []);

  const handleRestart = useCallback(() => {
    setRestartKey((value) => value + 1);
    setIsPlaying(true);
  }, []);

  const handleRecord = useCallback(() => {
    const recorder =
      format === "landscape" ? landscapeRecorderRef.current : shortsRecorderRef.current;

    if (isRecording) {
      recorder?.stopRecording?.();
      return;
    }

    setIsPlaying(true);
    recorder?.startRecording?.();
  }, [format, isRecording]);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 88px)",
        background:
          "radial-gradient(circle at 20% 12%, rgba(34,211,238,0.16), transparent 30%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.2), transparent 28%), linear-gradient(145deg, #020617, #080b18 52%, #030712)",
        color: "white",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  color: "#67e8f9",
                  border: "1px solid rgba(103,232,249,0.28)",
                  background: "rgba(103,232,249,0.1)",
                  boxShadow: "0 0 34px rgba(103,232,249,0.18)",
                }}
              >
                <Sparkles size={22} />
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
                  Esbiko Art & Science
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 950,
                    letterSpacing: 0,
                    lineHeight: 1.02,
                    fontSize: { xs: 32, md: 48 },
                  }}
                >
                  Image Motion Studio
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 380px" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.11)",
                background: "rgba(255,255,255,0.045)",
                p: { xs: 1.4, md: 2 },
                backdropFilter: "blur(20px)",
                boxShadow: "0 30px 120px rgba(0,0,0,0.38)",
              }}
            >
              <Box
                sx={{
                  mx: "auto",
                  width: "100%",
                  maxWidth: format === "shorts" ? 430 : 980,
                  aspectRatio: `${output.width} / ${output.height}`,
                }}
              >
                <ImageMotionCanvas
                  slides={slides}
                  format={format}
                  presetKey={presetKey}
                  secondsPerImage={secondsPerImage}
                  isPlaying={isPlaying}
                  showCaptions={showCaptions}
                  restartKey={restartKey}
                />
              </Box>
              <Typography
                sx={{
                  mt: 1.4,
                  color: "rgba(226,242,255,0.52)",
                  textAlign: "center",
                  fontSize: 13,
                }}
              >
                {slides.length
                  ? `${slides.length} image sequence - ${totalDuration.toFixed(1)} seconds`
                  : "Canvas is ready for upload, preview, and recording."}
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(5,10,24,0.74)",
                p: 2.2,
                backdropFilter: "blur(24px)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.36)",
              }}
            >
              <ImageMotionControls
                slides={slides}
                format={format}
                presetKey={presetKey}
                secondsPerImage={secondsPerImage}
                showCaptions={showCaptions}
                isPlaying={isPlaying}
                isRecording={isRecording}
                onUpload={handleUpload}
                onFormatChange={setFormat}
                onPresetChange={handlePresetChange}
                onSecondsChange={handleSecondsChange}
                onShowCaptionsChange={setShowCaptions}
                onCaptionChange={handleCaptionChange}
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
        fileName={`esbiko-image-motion-shorts-${Date.now()}.webm`}
        fps={60}
        videoBitsPerSecond={55000000}
        codecMode="realtime-quality"
        showButton={false}
        onRecordingChange={setIsRecording}
      />
      <VideoRecorderControls
        ref={landscapeRecorderRef}
        canvasSelector=".image-motion-canvas"
        outputMode="landscape"
        fileName={`esbiko-image-motion-landscape-${Date.now()}.webm`}
        fps={60}
        videoBitsPerSecond={70000000}
        codecMode="realtime-quality"
        showButton={false}
        onRecordingChange={setIsRecording}
      />
    </Box>
  );
}
