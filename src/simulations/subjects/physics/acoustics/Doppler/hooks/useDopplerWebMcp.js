import { useEffect, useRef, useState } from "react";

import {
  getDocumentModelContext,
  registerWebMcpTools,
  WEBMCP_REGISTRATION_STATUS,
} from "../../../../../../webmcp/registerWebMcpTools.js";
import { createDopplerWebMcpTools } from "../adapter/dopplerTools.js";

export function useDopplerWebMcp(actions) {
  const actionsRef = useRef(actions);
  const [status, setStatus] = useState(WEBMCP_REGISTRATION_STATUS.REGISTERING);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    const controller = new AbortController();
    const modelContext = getDocumentModelContext();
    const tools = createDopplerWebMcpTools({
      getState: (...args) => actionsRef.current.getState(...args),
      configure: (...args) => actionsRef.current.configure(...args),
      setPlayback: (...args) => actionsRef.current.setPlayback(...args),
      reset: (...args) => actionsRef.current.reset(...args),
    });

    registerWebMcpTools({
      modelContext,
      tools,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setStatus(result.status);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.warn("Doppler WebMCP tool registration failed:", error);
          setStatus(WEBMCP_REGISTRATION_STATUS.ERROR);
        }
      });

    return () => controller.abort();
  }, []);

  return status;
}
