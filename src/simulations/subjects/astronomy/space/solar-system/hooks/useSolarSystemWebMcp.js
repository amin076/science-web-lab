import { useEffect, useRef, useState } from "react";

import {
  getDocumentModelContext,
  registerWebMcpTools,
  WEBMCP_REGISTRATION_STATUS,
} from "@/webmcp/registerWebMcpTools.js";
import { createSolarSystemWebMcpTools } from "../adapter/solarSystemTools.js";

export function useSolarSystemWebMcp(actions) {
  const enabled = actions?.enabled !== false;
  const actionsRef = useRef(actions);
  const [status, setStatus] = useState(WEBMCP_REGISTRATION_STATUS.REGISTERING);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (!enabled) {
      setStatus(WEBMCP_REGISTRATION_STATUS.UNSUPPORTED);
      return undefined;
    }

    const controller = new AbortController();
    const tools = createSolarSystemWebMcpTools({
      getState: (...args) => actionsRef.current.getState(...args),
      configure: (...args) => actionsRef.current.configure(...args),
      setPlayback: (...args) => actionsRef.current.setPlayback(...args),
      reset: (...args) => actionsRef.current.reset(...args),
      setTour: (...args) => actionsRef.current.setTour(...args),
      startVideo: (...args) => actionsRef.current.startVideo(...args),
      getVideoStatus: (...args) => actionsRef.current.getVideoStatus(...args),
      stopVideo: (...args) => actionsRef.current.stopVideo(...args),
      downloadVideo: (...args) => actionsRef.current.downloadVideo(...args),
    });

    registerWebMcpTools({
      modelContext: getDocumentModelContext(),
      tools,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setStatus(result.status);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.warn("Solar System WebMCP registration failed:", error);
          setStatus(WEBMCP_REGISTRATION_STATUS.ERROR);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  return status;
}
