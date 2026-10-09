  const initialMcp = useMemo(
    () => readEmbeddedMcpParameters("creative.patterns.ambient-pattern-studio", {
    pattern: "kaleidoscope",
    palette: "aurora",
    speed: 2,
    loopSeconds: 60,
    symmetry: 10,
    intensity: 1.1,
    bloom: 1.2,
    depth: 1.05,
    complexity: 0.7,
    rotation: 0.5,
    drift: 0.55,
    particles: 130,
    backgroundGlow: 0.95,
  }),[]);
  const [settings,setSettings]=useState(() => {
    const {recordingSeconds,recordingFps,...patternSettings}=initialMcp.values;
    return patternSettings;
  });
  useEffect(() => {
    if (initialMcp.values.recordingSeconds !== undefined) setRecordingSeconds(initialMcp.values.recordingSeconds);
    if (initialMcp.values.recordingFps !== undefined) setRecordingFps(initialMcp.values.recordingFps);
  }, [initialMcp]);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const liveRef=useRef({});
  liveRef.current={settings,isPlaying,isRecording,recordingSeconds,recordingFps,captureGuide};
  const actionsRef=useRef({});
  // Recorder callbacks below are registered after their definitions; tools use current callbacks.
  useEffect(()=>{
    const controller=new AbortController();
    const keys={
      pattern:{type:"string",enum:PATTERN_PRESETS.map(p=>p.value)},
      palette:{type:"string",enum:PALETTE_PRESETS.map(p=>p.value)},
      speed:{type:"number",minimum:1,maximum:6},
      loopSeconds:{type:"number",minimum:15,maximum:180},
      symmetry:{type:"number",minimum:3,maximum:24},
      complexity:{type:"number",minimum:0,maximum:1},
      intensity:{type:"number",minimum:0.1,maximum:2},
      bloom:{type:"number",minimum:0,maximum:3},
      depth:{type:"number",minimum:0,maximum:2},
      drift:{type:"number",minimum:0,maximum:1.5},
      rotation:{type:"number",minimum:-2,maximum:2},
      backgroundGlow:{type:"number",minimum:0,maximum:2},
      particles:{type:"number",minimum:0,maximum:260},
      recordingSeconds:{type:"number",minimum:15,maximum:600},
      recordingFps:{type:"number",enum:[30,60]},
    };
    const empty={type:"object",properties:{},additionalProperties:false};
    const tools=[
      {name:"esbiko_ambient_get_state",description:"Read pattern, palette, all visual settings, timeline and recording status.",
       annotations:{readOnlyHint:true},inputSchema:empty,
       execute:createSafeToolExecutor("ambient_get_state",async()=>({
         simulationId:"creative.patterns.ambient-pattern-studio",
         ...liveRef.current,elapsedSeconds:elapsedRef.current,
       }))},
      {name:"esbiko_ambient_configure",description:"Configure the same visual and recording settings controlled by the Ambient Pattern Studio interface.",
       inputSchema:{type:"object",properties:keys,additionalProperties:false},
       execute:createSafeToolExecutor("ambient_configure",async(input)=>{
         if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Expected ambient settings object");
         for(const [key,value] of Object.entries(input)){
           const rule=keys[key];
           if(!rule||typeof value!==rule.type||(rule.enum&&!rule.enum.includes(value))||
             (rule.type==="number"&&(!Number.isFinite(value)|| (rule.minimum!==undefined&&value<rule.minimum)||
                (rule.maximum!==undefined&&value>rule.maximum))))
             throw Error("Invalid Ambient Studio parameter: "+key);
         }
         if(liveRef.current.isRecording)throw Error("Stop recording before changing recording configuration");
         const {recordingSeconds,recordingFps,...visual}=input;
         if(recordingSeconds!==undefined)actionsRef.current.setRecordingSeconds(recordingSeconds);
         if(recordingFps!==undefined)actionsRef.current.setRecordingFps(recordingFps);
         if(Object.keys(visual).length)actionsRef.current.setSettings(previous=>({...previous,...visual}));
         liveRef.current={...liveRef.current,settings:{...liveRef.current.settings,...visual},
           ...(recordingSeconds!==undefined?{recordingSeconds}:{}),
           ...(recordingFps!==undefined?{recordingFps}:{})};
         return {accepted:input};
       })},
      {name:"esbiko_ambient_set_playback",description:"Play or pause the ambient canvas animation.",
       inputSchema:{type:"object",properties:{playing:{type:"boolean"}},required:["playing"],additionalProperties:false},
       execute:createSafeToolExecutor("ambient_set_playback",async({playing})=>{
         if(typeof playing!=="boolean")throw Error("playing must be boolean");
         actionsRef.current.setIsPlaying(playing);liveRef.current={...liveRef.current,isPlaying:playing};
         return {playing};
       })},
      {name:"esbiko_ambient_reset",description:"Reset the animation timeline (keeps current visual settings).",
       inputSchema:empty,execute:createSafeToolExecutor("ambient_reset",async()=>{
         actionsRef.current.resetTime();return {elapsedSeconds:0};
       })},
      {name:"esbiko_ambient_randomize",description:"Generate a new random pattern and palette using the same UI randomizer.",
       inputSchema:empty,execute:createSafeToolExecutor("ambient_randomize",async()=>{
         actionsRef.current.randomize();return {randomized:true};
       })},
      {name:"esbiko_ambient_record",description:"Start or stop WebM recording of landscape or shorts canvas. Requires browser MediaRecorder support; download handled by shared recorder.",
       inputSchema:{type:"object",properties:{command:{type:"string",enum:["start","stop"]},
         mode:{type:"string",enum:["landscape","shorts"]}},required:["command"],additionalProperties:false},
       execute:createSafeToolExecutor("ambient_record",async({command,mode="landscape"})=>{
         if(!["start","stop"].includes(command)||!["landscape","shorts"].includes(mode))
           throw Error("Invalid recording operation");
         if(command==="stop"){actionsRef.current.stopRecording();return {requestedStop:true};}
         const started=actionsRef.current.startRecording(mode);
         if(!started)throw Error("Could not start recording; check browser MediaRecorder permissions and recorder availability");
         return {started:true,mode};
       })},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal})
      .catch(error=>{if(!controller.signal.aborted)console.warn("Ambient WebMCP",error)});
    return ()=>controller.abort();
  },[]);

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearRecordingTimer();
    landscapeRecorderRef.current?.stopRecording?.();
    shortsRecorderRef.current?.stopRecording?.();
  }, [clearRecordingTimer]);

  const startRecording = useCallback(
    (mode) => {
      if (isRecording) return false;

      setCaptureGuide(mode);
      const recorder =
        mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
      const started = recorder?.startRecording?.();

      if (!started) return false;

      const durationMs = Math.max(0, recordingSeconds) * 1000;
      if (durationMs > 0) {
        clearRecordingTimer();
        recordingTimeoutRef.current = window.setTimeout(() => {
          recorder?.stopRecording?.();
          recordingTimeoutRef.current = null;
        }, durationMs);
      }
      return true;
    },
    [clearRecordingTimer, isRecording, recordingSeconds],
  );

  const chooseRecordingFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      alert(
        "This browser does not support direct folder saving. Files will download normally.",
      );
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
      const permission = await directoryHandle.requestPermission?.({
        mode: "readwrite",
      });

      if (permission && permission !== "granted") {
        alert("Folder write permission was not granted.");
        return;
      }

      setRecordingDirectory(directoryHandle);
      setRecordingDirectoryName(directoryHandle.name);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Could not choose recording folder.", error);
        alert("Could not choose recording folder. Files will download normally.");
      }
    }
  }, []);

  const randomize = useCallback(() => {
    const pattern = PATTERN_PRESETS[Math.floor(Math.random() * PATTERN_PRESETS.length)];
    const palette = PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];

    setSettings((current) => ({
      ...current,
      pattern: pattern.value,
      palette: palette.value,
      speed: 1 + Math.floor(Math.random() * 4),
      symmetry: 5 + Math.floor(Math.random() * 12),
      intensity: 0.65 + Math.random() * 0.85,
      bloom: 0.65 + Math.random() * 1.25,
      depth: 0.45 + Math.random() * 1.25,
      complexity: 0.35 + Math.random() * 0.6,
      rotation: -0.9 + Math.random() * 1.8,
      drift: Math.random(),
      particles: 60 + Math.floor(Math.random() * 160),
      backgroundGlow: 0.35 + Math.random() * 1.15,
    }));
  }, []);

  const resetTime = useCallback(() => {
    elapsedRef.current = 0;
    lastRef.current = performance.now();
  }, []);

  useEffect(() => {
    const draw = (now) => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      const rawDt = (now - (lastRef.current || now)) / 1000;
      const dt = Math.min(Math.max(rawDt, 0), MAX_FRAME_DELTA_SECONDS);
      lastRef.current = now;

      if (isPlaying) elapsedRef.current += dt;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      renderAmbientPattern(ctx, canvas.width, canvas.height, elapsedRef.current, settingsRef.current);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const sourceRatio = CANVAS_W / CANVAS_H;
      const containerRatio = rect.width / Math.max(1, rect.height);
      let width = rect.width;
      let height = rect.height;
      let left = 0;
      let top = 0;

      if (containerRatio > sourceRatio) {
        height = rect.height;
        width = height * sourceRatio;
        left = (rect.width - width) / 2;
      } else {
        width = rect.width;
        height = width / sourceRatio;
        top = (rect.height - height) / 2;
      }

      setCanvasBounds({ left, top, width, height });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  actionsRef.current={setSettings,setIsPlaying,setRecordingSeconds,setRecordingFps,
    resetTime,randomize,startRecording,stopRecording};
  useEffect(() => () => clearRecordingTimer(), [clearRecordingTimer]);

  return (
    <div className="flex flex-col xl:flex-row h-full w-full min-w-0 overflow-y-auto xl:overflow-hidden bg-black text-white">
      <div ref={containerRef} data-esbiko-ambient-stage className="relative w-full shrink-0 h-[min(58dvh,560px)] min-h-[260px] xl:h-full xl:min-h-0 xl:flex-1 xl:shrink bg-black">
        <canvas
          id="ambient-pattern-recording-canvas"
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block h-full w-full object-contain"
        />

        <VideoRecorderControls
          ref={landscapeRecorderRef}
          canvasSelector="#ambient-pattern-recording-canvas"
          outputMode="landscape"
          fileName={`esbiko-ambient-pattern-landscape-${Date.now()}.webm`}
          fps={recordingFps}
          videoBitsPerSecond={90000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
        />
        <VideoRecorderControls
          ref={shortsRecorderRef}
          canvasSelector="#ambient-pattern-recording-canvas"
          outputMode="shorts"
          fileName={`esbiko-ambient-pattern-shorts-${Date.now()}.webm`}
          fps={recordingFps}
          videoBitsPerSecond={75000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
        />

        <CaptureGuide
          mode={captureGuide}
          bounds={canvasBounds}
          isRecording={isRecording}
        />
      </div>

      <aside data-esbiko-ambient-controls className="w-full xl:w-[390px] shrink-0 xl:h-full overflow-y-auto border-l border-white/10 bg-slate-950/88 p-4 shadow-[-24px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
            <Sparkles size={23} />
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">Ambient Pattern</h2>
            <p className="text-xs text-white/55">Seamless video background studio</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsPlaying((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-lg border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-yellow-300 transition-colors hover:bg-yellow-400/15"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetTime}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm font-black uppercase tracking-wide text-white/80 transition-colors hover:bg-white/12"
          >
            <RefreshCcw size={15} />
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <Panel title="Pattern Design" icon={Sparkles}>
            <div className="space-y-3">
              <SelectField
                label="Pattern"
                value={settings.pattern}
                options={PATTERN_PRESETS}
                onChange={(value) => updateSetting("pattern", value)}
              />
              <SelectField
                label="Palette"
                value={settings.palette}
                options={PALETTE_PRESETS}
                onChange={(value) => updateSetting("palette", value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Speed"
                  value={settings.speed}
                  min={1}
                  max={6}
                  step={1}
                  unit="x"
                  onChange={(value) => updateSetting("speed", value)}
                />
                <Slider
                  label="Loop"
                  value={settings.loopSeconds}
                  min={15}
                  max={180}
                  step={15}
                  unit="s"
                  onChange={(value) => updateSetting("loopSeconds", value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Symmetry"
                  value={settings.symmetry}
                  min={3}
                  max={24}
                  step={1}
                  onChange={(value) => updateSetting("symmetry", value)}
                />
                <Slider
                  label="Complexity"
                  value={settings.complexity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(value) => updateSetting("complexity", value)}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Cinematic Finish" icon={Frame}>
            <div className="grid grid-cols-2 gap-4">
              <Slider
                label="Intensity"
                value={settings.intensity}
                min={0.1}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("intensity", value)}
              />
              <Slider
                label="Bloom"
                value={settings.bloom}
                min={0}
                max={3}
                step={0.05}
                onChange={(value) => updateSetting("bloom", value)}
              />
              <Slider
                label="Depth"
                value={settings.depth}
                min={0}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("depth", value)}
              />
              <Slider
                label="Drift"
                value={settings.drift}
                min={0}
                max={1.5}
                step={0.05}
                onChange={(value) => updateSetting("drift", value)}
              />
              <Slider
                label="Rotation"
                value={settings.rotation}
                min={-2}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("rotation", value)}
              />
              <Slider
                label="Atmosphere"
                value={settings.backgroundGlow}
                min={0}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("backgroundGlow", value)}
              />
            </div>
            <div className="mt-3">
              <Slider
                label="Particles"
                value={settings.particles}
                min={0}
                max={260}
                step={1}
                onChange={(value) => updateSetting("particles", value)}
              />
            </div>
            <button
              onClick={randomize}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-fuchsia-100 transition-colors hover:bg-fuchsia-300/15"
            >
              <Shuffle size={15} />
              Random Beautiful Pattern
            </button>
          </Panel>

          <Panel title="Video Recording" icon={Video}>
            <div className="mb-3 rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/55">
              Recordings use the shared canvas recorder and save 60s numbered parts
              when a folder is selected.
            </div>
            <button
              onClick={chooseRecordingFolder}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-300/15"
            >
              <FolderOpen size={15} />
              Choose Save Folder
            </button>
            <div className="mb-3 text-xs text-white/45">
              {recordingDirectoryName
                ? `Saving to ${recordingDirectoryName}`
                : "No folder selected. Browser downloads fallback."}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Slider
                label="Duration"
                value={recordingSeconds}
                min={15}
                max={600}
                step={15}
                unit="s"
                onChange={setRecordingSeconds}
              />
              <Slider
                label="FPS"
                value={recordingFps}
                min={30}
                max={60}
                step={30}
                onChange={setRecordingFps}
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCaptureGuide("landscape")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  captureGuide === "landscape"
                    ? "bg-cyan-300/18 text-cyan-100"
                    : "bg-black/30 text-white/55 hover:bg-white/8"
                }`}
              >
                <Monitor size={14} />
                16:9
              </button>
              <button
                onClick={() => setCaptureGuide("shorts")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  captureGuide === "shorts"
                    ? "bg-cyan-300/18 text-cyan-100"
                    : "bg-black/30 text-white/55 hover:bg-white/8"
                }`}
              >
                <Smartphone size={14} />
                9:16
              </button>
            </div>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300/25 bg-red-400/15 px-3 py-2 text-sm font-black uppercase tracking-wide text-red-100 transition-colors hover:bg-red-400/20"
              >
                <Pause size={15} />
                Stop Recording
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => startRecording("landscape")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/15"
                >
                  <Download size={14} />
                  Record 16:9
                </button>
                <button
                  onClick={() => startRecording("shorts")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/15"
                >
                  <Download size={14} />
                  Record 9:16
                </button>
              </div>
            )}
          </Panel>
        </div>
      </aside>
    </div>
  );
}
