// public/service-worker.js
// Service Worker for Science Web Lab

const CACHE_NAME = "science-web-lab-v2"; // ✅ bump to force clean old cache
const STATIC_ASSETS = [
  "/favicon.svg",
  "/esbiko-logo-192.png",
  "/esbiko-logo-512.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // ✅ activate newer SW ASAP
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  console.log("[SW] Installed");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      );
      await self.clients.claim(); // ✅ control pages immediately
      console.log("[SW] Activated");
    })()
  );
});

// Helpers
const isNavigation = (request) => request.mode === "navigate";
const isAssetRequest = (request) =>
  ["script", "style", "image", "font", "worker"].includes(request.destination);

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // ✅ 1) SPA navigation: NETWORK-FIRST (avoid stale index.html)
  if (isNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put("/index.html", fresh.clone()); // store latest shell for offline
          return fresh;
        } catch {
          const cachedIndex = await caches.match("/index.html");
          return cachedIndex || new Response("Offline", { status: 503 });
        }

      })()
    );
    return;
  }

  // ✅ 2) Static assets: CACHE-FIRST
  if (isAssetRequest(request)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const resp = await fetch(request);
        // cache only successful basic responses
        if (resp && resp.status === 200 && resp.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, resp.clone());
        }
        return resp;
      })()
    );
    return;
  }

  // ✅ 3) Other requests: just pass-through (no weird fallbacks)
  event.respondWith(fetch(request));
});
