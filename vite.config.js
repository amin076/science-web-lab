// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "esbiko-logo-192.png",
        "esbiko-logo-512.png",
      ],

      manifest: {
        name: "Esbiko",
        short_name: "Esbiko",
        description:
          "Interactive science simulations and virtual labs for students and teachers",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#e8f0fe",
        theme_color: "#1a73e8",
        orientation: "any",
        icons: [
          {
            src: "/esbiko-logo-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/esbiko-logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: ["**/*.{js,css,html,ico,svg,png}"],

        globIgnores: [
          "**/*.{glb,gltf,bin,stl,mp3,wav,ogg,jpg,jpeg,webp}",
          "**/astronaut.glb",
          "**/space-shuttle.glb",
          "**/ball.jpg",
        ],

        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "esbiko-runtime-images",
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.endsWith(".glb") ||
              url.pathname.endsWith(".gltf") ||
              url.pathname.endsWith(".bin") ||
              url.pathname.endsWith(".stl"),
            handler: "CacheFirst",
            options: {
              cacheName: "esbiko-runtime-3d-models",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.endsWith(".mp3") ||
              url.pathname.endsWith(".wav") ||
              url.pathname.endsWith(".ogg"),
            handler: "CacheFirst",
            options: {
              cacheName: "esbiko-runtime-audio",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),

      // 🚨 THIS IS THE CRITICAL FIX FOR THE CRASH
      three: path.resolve(__dirname, "node_modules/three"),
    },
  },
});
