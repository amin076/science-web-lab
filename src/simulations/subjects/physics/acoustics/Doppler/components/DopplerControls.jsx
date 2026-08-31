// src/simulations/subjects/physics/acoustics/Doppler/components/DopplerControls.jsx
import { useState } from "react";

import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  Ear,
  Activity,
  Music,
  Car,
  FlaskConical,
  Bot,
  Check,
  ChevronDown,
  Clipboard,
  ExternalLink,
  Wrench,
} from "lucide-react";

import { MAX_DISTANCE, SOURCE_PRESETS } from "../constants";
import {
  DOPPLER_WEBMCP_TEST_PROMPT,
  DOPPLER_WEBMCP_TOOL_NAMES,
  formatDopplerResultSummary,
  getWebMcpGuideStatus,
} from "../webMcpGuide";
import SourceControlCard from "./SourceControlCard";

const DopplerControls = ({
  mode,
  isRunning,
  masterVolume,
  observer,
  sources,
  onModeChange,
  onTogglePlay,
  onReset,
  onAddSource,
  onAddCarPreset,
  onRemoveSource,
  onUpdateSourceVal,
  onSetObserver,
  onSetMasterVolume,
  masterGainRef,
  webMcpStatus,
  lastAgentAction,
}) => {
  const agentToolsReady = webMcpStatus === "ready";
  const [isAgentGuideOpen, setIsAgentGuideOpen] = useState(true);
  const [promptCopied, setPromptCopied] = useState(false);
  const guideStatus = getWebMcpGuideStatus(webMcpStatus);
  const resultSummary = formatDopplerResultSummary(sources);

  const copyTestPrompt = async () => {
    try {
      await navigator.clipboard.writeText(DOPPLER_WEBMCP_TEST_PROMPT);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 2000);
    } catch (error) {
      console.warn("Could not copy the WebMCP test prompt:", error);
    }
  };

  return (
    <aside className="w-96 h-full bg-slate-950/80 border-l border-white/10 backdrop-blur-md flex flex-col shadow-2xl z-50">
      <div className="p-6 border-b border-white/10 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Activity className="text-blue-500" /> Doppler Lab
        </h2>

        <button
          type="button"
          onClick={() => setIsAgentGuideOpen((open) => !open)}
          aria-expanded={isAgentGuideOpen}
          className={`mt-3 w-full rounded-xl border p-3 text-left transition-colors ${
            agentToolsReady
              ? "border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/15"
              : "border-slate-700 bg-slate-950/70 hover:bg-slate-900"
          }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                agentToolsReady
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Bot size={18} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-xs font-bold text-white">
                AI Agent <span className="text-slate-500">·</span> WebMCP
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide ${
                    agentToolsReady
                      ? "bg-emerald-400/15 text-emerald-300"
                      : webMcpStatus === "error"
                        ? "bg-rose-400/15 text-rose-300"
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {guideStatus.label}
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                {guideStatus.detail}
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-500 transition-transform ${
                isAgentGuideOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            onClick={() => onModeChange("scientific")}
            className={`py-2 rounded border text-xs font-bold flex items-center justify-center gap-2 ${
              mode === "scientific"
                ? "bg-blue-500/20 border-blue-400 text-blue-300"
                : "bg-slate-900 border-white/10 text-slate-400"
            }`}
          >
            <FlaskConical size={14} /> 2D Mode
          </button>

          <button
            onClick={() => onModeChange("car")}
            className={`py-2 rounded border text-xs font-bold flex items-center justify-center gap-2 ${
              mode === "car"
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-slate-900 border-white/10 text-slate-400"
            }`}
          >
            <Car size={14} /> 3D Mode
          </button>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onTogglePlay}
            className={`flex-1 py-2 rounded font-bold flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                : "bg-emerald-500 text-slate-900"
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} /> Run Simulation
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="px-3 rounded bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {isAgentGuideOpen && (
          <section
            aria-label="WebMCP agent testing guide"
            className="space-y-4 rounded-xl border border-blue-400/25 bg-gradient-to-b from-blue-400/10 to-slate-950/40 p-4"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                <Wrench size={14} /> Test with an AI agent
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-300">
                {guideStatus.help}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Judge test prompt
                </span>
                <button
                  type="button"
                  onClick={copyTestPrompt}
                  className="flex items-center gap-1 rounded-md border border-blue-400/30 bg-blue-400/10 px-2 py-1 text-[10px] font-bold text-blue-200 hover:bg-blue-400/20"
                >
                  {promptCopied ? <Check size={11} /> : <Clipboard size={11} />}
                  {promptCopied ? "Copied" : "Copy prompt"}
                </button>
              </div>
              <p className="select-text text-[11px] leading-5 text-slate-300">
                {DOPPLER_WEBMCP_TEST_PROMPT}
              </p>
            </div>

            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Available tools ({DOPPLER_WEBMCP_TOOL_NAMES.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DOPPLER_WEBMCP_TOOL_NAMES.map((toolName) => (
                  <code
                    key={toolName}
                    className="rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-[9px] text-slate-300"
                  >
                    {toolName}
                  </code>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Last agent action
                </div>
                <div className="mt-1 text-[11px] text-blue-200">
                  {lastAgentAction || "Waiting for an agent tool call"}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Live result
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-300">
                  {resultSummary}
                </div>
              </div>
            </div>

            <a
              href="https://learn.chatgpt.com/docs/webmcp"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 hover:text-blue-200"
            >
              OpenAI Site Tools guide <ExternalLink size={11} />
            </a>
          </section>
        )}

        {mode === "car" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
              <Car size={14} /> 3D Presets
            </div>

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SOURCE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onAddCarPreset(key)}
                  className="text-[11px] rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 py-2"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
            <Ear size={14} /> The Listener
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/20 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Position (x)</span>
                <span className="font-mono">{Math.round(observer.x)} m</span>
              </div>

              <input
                type="range"
                min="0"
                max={MAX_DISTANCE}
                step="1"
                value={observer.x}
                onChange={(e) =>
                  onSetObserver((p) => ({
                    ...p,
                    x: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Velocity (v)</span>
                <span className="font-mono text-blue-400">
                  {observer.v} m/s
                </span>
              </div>

              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={observer.v}
                onChange={(e) =>
                  onSetObserver((p) => ({
                    ...p,
                    v: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
              <Volume2 size={14} />{" "}
              {mode === "car" ? "3D Source" : "2D Sound Sources"}
            </div>

            {mode !== "car" && (
              <button
                onClick={onAddSource}
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded hover:bg-emerald-500/20 flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {sources.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
              No sources active.
            </div>
          )}

          {sources.map((source, idx) => (
            <SourceControlCard
              key={source.id}
              source={source}
              index={idx}
              mode={mode}
              onRemoveSource={onRemoveSource}
              onUpdateSourceVal={onUpdateSourceVal}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-slate-900/50 text-xs text-slate-500">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 size={14} /> Master Volume
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onSetMasterVolume(v);

            if (masterGainRef.current) {
              masterGainRef.current.gain.value = v;
            }
          }}
          className="w-full h-1 bg-slate-700 rounded accent-slate-400 cursor-pointer"
        />
      </div>
    </aside>
  );
};

export default DopplerControls;
