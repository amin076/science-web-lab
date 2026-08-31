import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDocumentModelContext,
  registerWebMcpTools,
} from "./registerWebMcpTools.js";
import { createEsbikoSiteTools } from "./siteTools.js";

export default function WebMcpSiteTools() {
  const navigate = useNavigate();
  const tools = useMemo(() => createEsbikoSiteTools({ navigate }), [navigate]);

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
