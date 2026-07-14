import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  await server.ssrLoadModule("/src/platform/api/PlatformApi.test.js");
} finally {
  await server.close();
}
