export const WEBMCP_REGISTRATION_STATUS = Object.freeze({
  UNSUPPORTED: "unsupported",
  REGISTERING: "registering",
  READY: "ready",
  ERROR: "error",
});

export function getDocumentModelContext(documentRef = globalThis.document) {
  return documentRef?.modelContext || null;
}

export async function registerWebMcpTools({
  modelContext,
  tools,
  signal,
}) {
  if (!modelContext || typeof modelContext.registerTool !== "function") {
    return {
      status: WEBMCP_REGISTRATION_STATUS.UNSUPPORTED,
      registered: [],
    };
  }

  const registered = [];

  for (const tool of tools) {
    await modelContext.registerTool(tool, { signal });
    registered.push(tool.name);
  }

  return {
    status: WEBMCP_REGISTRATION_STATUS.READY,
    registered,
  };
}

export function createJsonToolResult(data) {
  return JSON.stringify(data);
}

export function createSafeToolExecutor(action, execute) {
  return async (input = {}, context = {}) => {
    try {
      const data = await execute(input, context);

      return createJsonToolResult({
        ok: true,
        action,
        data,
      });
    } catch (error) {
      return createJsonToolResult({
        ok: false,
        action,
        error: {
          code: error?.code || "TOOL_EXECUTION_FAILED",
          message: error?.message || "The tool could not complete the action.",
        },
      });
    }
  };
}
