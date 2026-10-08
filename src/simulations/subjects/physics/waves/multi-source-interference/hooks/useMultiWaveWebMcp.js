import { useEffect, useRef, useState } from "react";
import {
  getDocumentModelContext, registerWebMcpTools, WEBMCP_REGISTRATION_STATUS,
} from "@/webmcp/registerWebMcpTools.js";
import { createMultiWaveWebMcpTools } from "../multiWaveWebMcpTools.js";

export function useMultiWaveWebMcp(actions) {
  const latest = useRef(actions);
  latest.current = actions;
  const [status, setStatus] = useState(WEBMCP_REGISTRATION_STATUS.REGISTERING);

  useEffect(() => {
    const controller = new AbortController();
    if (latest.current.enabled === false) {
      setStatus(WEBMCP_REGISTRATION_STATUS.UNSUPPORTED);
      return () => controller.abort();
    }
    const forwarded = Object.fromEntries(
      ["getState", "configure", "playback", "addSource", "updateSource",
        "removeSource", "configureVideo", "startVideo", "getVideoStatus",
        "stopVideo", "downloadVideo"].map((name) => [
        name, (...args) => latest.current[name](...args),
      ]),
    );
    registerWebMcpTools({
      modelContext: getDocumentModelContext(),
      tools: createMultiWaveWebMcpTools(forwarded),
      signal: controller.signal,
    }).then((result) => {
      if (!controller.signal.aborted) setStatus(result.status);
    }).catch((error) => {
      console.warn("Multi-source WebMCP registration failed:", error);
      if (!controller.signal.aborted) setStatus(WEBMCP_REGISTRATION_STATUS.ERROR);
    });
    return () => controller.abort();
  }, []);
  return status;
}
