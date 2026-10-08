import { useEffect, useRef, useState } from "react";
import { getDocumentModelContext, registerWebMcpTools, WEBMCP_REGISTRATION_STATUS } from "@/webmcp/registerWebMcpTools.js";
import { createOrbitLabWebMcpTools } from "../adapter/orbitLabTools.js";

export function useOrbitLabWebMcp(actions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const [status, setStatus] = useState(WEBMCP_REGISTRATION_STATUS.REGISTERING);
  useEffect(() => {
    const controller = new AbortController();
    const forwarded = Object.fromEntries(
      ["getState", "configure", "setPlayback", "focus", "addPreset", "reset"].map(
        (name) => [name, (...args) => actionsRef.current[name](...args)],
      ),
    );
    registerWebMcpTools({
      modelContext: getDocumentModelContext(),
      tools: createOrbitLabWebMcpTools(forwarded),
      signal: controller.signal,
    }).then((result) => {
      if (!controller.signal.aborted) setStatus(result.status);
    }).catch((error) => {
      console.warn("Orbit Lab WebMCP registration failed:", error);
      if (!controller.signal.aborted) setStatus(WEBMCP_REGISTRATION_STATUS.ERROR);
    });
    return () => controller.abort();
  }, []);
  return status;
}
