// Service Worker for Science Web Lab
const CACHE_NAME = "science-web-lab-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/esbiko-logo-192.png",
  "/esbiko-logo-512.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  console.log("[SW] Installed and cached static assets");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
      )
  );
  console.log("[SW] Activated and old caches cleared");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached || fetch(event.request).catch(() => caches.match("/index.html"))
      );
    })
  );
});
