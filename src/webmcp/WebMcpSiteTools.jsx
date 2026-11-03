import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDocumentModelContext,
  registerWebMcpTools,
} from "./registerWebMcpTools.js";
import { createEsbikoSiteTools } from "./siteTools.js";
import { createSafeToolExecutor } from "./registerWebMcpTools.js";
import { discoverSimulationUiControls, operateSimulationUiControl } from "./simulationUiControls.js";

export default function WebMcpSiteTools() {
  const navigate = useNavigate();
  const tools = useMemo(() => [
    ...createEsbikoSiteTools({ navigate }),
    {
      name: "discover_simulation_ui_controls",
      description: "List visible native buttons, tabs, inputs and sliders in the active simulation. Indices are temporary. Canvas/3D gestures require separate adapters.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: createSafeToolExecutor("discover_simulation_ui_controls", discoverSimulationUiControls),
    },
    {
      name: "operate_simulation_ui_control",
      description: "Activate or set one previously discovered control in the active simulation. Discover again after UI changes. Cannot interact with page navigation or arbitrary canvas.",
      inputSchema: {type:"object", properties:{
        index:{type:"integer",minimum:0},
        action:{type:"string",enum:["activate","set"]},
        value:{type:["string","number","boolean"]}
      }, required:["index","action"],additionalProperties:false},
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("operate_simulation_ui_control", operateSimulationUiControl),
    },
  ], [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    const modelContext = getDocumentModelContext();

    registerWebMcpTools({
      modelContext,
      tools,
      signal: controller.signal,
    }).catch((error) => {
      if (!controller.signal.aborted) {
        console.warn("Esbiko WebMCP site tool registration failed:", error);
      }
    });

    return () => controller.abort();
  }, [tools]);

  return null;
}
