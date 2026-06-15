export default function VideoSafeAreaOverlay({
  mode = "shorts",
  visible = true,
}) {
  if (!visible || mode !== "shorts") return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "34.18%",
          width: "31.64%",
          borderLeft: "2px dashed rgba(255,255,255,0.75)",
          borderRight: "2px dashed rgba(255,255,255,0.75)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

    
    </>
  );
}