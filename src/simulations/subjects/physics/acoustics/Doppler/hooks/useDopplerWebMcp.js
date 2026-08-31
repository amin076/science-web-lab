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
      configureScene: (...args) => actionsRef.current.configureScene(...args),
      setPlayback: (...args) => actionsRef.current.setPlayback(...args),
      reset: (...args) => actionsRef.current.reset(...args),
      startDirector: (...args) => actionsRef.current.startDirector(...args),
      getDirectorStatus: (...args) => actionsRef.current.getDirectorStatus(...args),
      stopDirector: (...args) => actionsRef.current.stopDirector(...args),
      downloadDirector: (...args) => actionsRef.current.downloadDirector(...args),
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
