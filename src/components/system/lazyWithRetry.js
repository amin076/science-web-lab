import { lazy } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryableLazyError = (err) => {
  const msg = String(err?.message || err || "");

  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("Loading chunk") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Unexpected token '<'") // معمولاً یعنی به جای JS، HTML (404) برگشته
  );
};

export default function lazyWithRetry(factory, options = {}) {
  const retries = Number.isFinite(options.retries) ? options.retries : 2;
  const baseDelayMs = Number.isFinite(options.delayMs) ? options.delayMs : 400;

  return lazy(() => {
    let attempt = 0;

    const load = async () => {
      try {
        return await factory();
      } catch (err) {
        if (!isRetryableLazyError(err) || attempt >= retries) {
          throw err;
        }
        attempt += 1;
        await sleep(baseDelayMs * attempt);
        return load();
      }
    };

    return load();
  });
}
