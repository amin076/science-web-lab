import { useEffect, useRef, useState } from "react";
import {
  createSafeToolExecutor,
  getDocumentModelContext,
  registerWebMcpTools,
  WEBMCP_REGISTRATION_STATUS,
} from "./registerWebMcpTools.js";

function validateConfiguration(input, properties) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Configuration must be an object.");
  }
  for (const [key, value] of Object.entries(input)) {
    const rule = properties[key];
    if (!rule) throw new Error("Unknown simulation parameter: " + key);
    if (rule.type === "number" && (typeof value !== "number" || !Number.isFinite(value) ||
        (rule.minimum !== undefined && value < rule.minimum) ||
        (rule.maximum !== undefined && value > rule.maximum))) {
      throw new Error("Invalid value for " + key);
    }
    if (rule.type === "boolean" && typeof value !== "boolean") {
      throw new Error("Invalid boolean for " + key);
    }
    if (rule.type === "string" && (typeof value !== "string" ||
        (rule.enum && !rule.enum.includes(value)))) {
      throw new Error("Invalid option for " + key);
    }
  }
  return input;
}

// The same React state and setters drive both the UI and the agent; no shadow simulation.
export function useAgentSimulationTools({ simulationId, prefix, properties, actions }) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const propertiesRef = useRef(properties);
  propertiesRef.current = properties;
  const [status, setStatus] = useState(WEBMCP_REGISTRATION_STATUS.REGISTERING);

  useEffect(() => {
    const controller = new AbortController();
    const makeTool = (name, description, inputSchema, method, readOnly = false) => ({
      name: prefix + "_" + name,
      description,
      inputSchema,
      annotations: { readOnlyHint: readOnly, untrustedContentHint: false },
      execute: createSafeToolExecutor(name, (...args) => actionsRef.current[method](...args)),
    });
    const empty = { type: "object", properties: {}, additionalProperties: false };
    const tools = [
      makeTool("get_state", "Read the live physics and UI state of " + simulationId, empty, "getState", true),
      {
        name: prefix + "_configure",
        description: "Configure live physics and display settings; these are the same settings as the visible controls.",
        inputSchema: { type: "object", properties, additionalProperties: false },
        execute: createSafeToolExecutor("configure", (input) =>
          actionsRef.current.configure(validateConfiguration(input, propertiesRef.current))),
      },
      makeTool("set_playback", "Start or pause this simulation.",
        { type: "object", properties: { running: { type: "boolean" } }, required: ["running"], additionalProperties: false },
        "setPlayback"),
      makeTool("reset", "Reset the physics engine and pause the simulation.", empty, "reset"),
      makeTool("start_video", "Begin recording the visible simulation as silent WebM video. Browser media policies may require a user gesture.",
        { type: "object", properties: { mode: { type: "string", enum: ["landscape", "shorts"] } }, additionalProperties: false },
        "startVideo"),
      makeTool("video_status", "Read actual recording and file readiness state.", empty, "getVideoStatus", true),
      makeTool("stop_video", "Stop recording; wait until video_status reports ready.", empty, "stopVideo"),
      makeTool("download_video", "Download the last completed WebM file in this browser.", empty, "downloadVideo"),
    ];
    registerWebMcpTools({
      modelContext: getDocumentModelContext(), tools, signal: controller.signal,
    }).then((result) => {
      if (!controller.signal.aborted) setStatus(result.status);
    }).catch((error) => {
      if (!controller.signal.aborted) {
        console.warn(simulationId + " WebMCP registration failed:", error);
        setStatus(WEBMCP_REGISTRATION_STATUS.ERROR);
      }
    });
    return () => controller.abort();
  }, [simulationId, prefix, properties]);

  return status;
}
