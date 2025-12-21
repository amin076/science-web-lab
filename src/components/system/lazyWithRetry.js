/**
 * lazyWithRetry(importFn, options)
 * - Wraps a dynamic import with retry logic.
 * - If the module chunk fails to load (network/dev server hiccup), it retries a few times.
 * - If it still fails, React.lazy will reject and ErrorBoundary will catch it.
 *
 * NOTE:
 * We intentionally keep the final behavior simple:
 *   - Retries automatically
 *   - If still failing -> SimulationErrorBoundary fallback -> Back to /experiments
 */

export function lazyWithRetry(importFn, options = {}) {
  const {
    retries = 2, // total extra retries (so total attempts = retries + 1)
    retryDelayMs = 500,
  } = options;

  let attempt = 0;

  const load = () =>
    new Promise((resolve, reject) => {
      importFn()
        .then(resolve)
        .catch((err) => {
          const message = String(err?.message || err || "");
          const isChunkFail =
            message.includes("Failed to fetch dynamically imported module") ||
            message.includes("Loading chunk") ||
            message.includes("ChunkLoadError") ||
            message.includes("dynamically imported module");

          // If it's not a typical chunk/network issue, don't retry.
          if (!isChunkFail) return reject(err);

          if (attempt < retries) {
            attempt += 1;
            setTimeout(() => {
              load().then(resolve).catch(reject);
            }, retryDelayMs);
            return;
          }

          reject(err);
        });
    });

  // React.lazy expects: () => Promise<{ default: Component }>
  return load;
}
