import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: "Aetheris — L'Éveil des Cristaux",
        short_name: "Aetheris",
        description: "Terreval Finale — MMORPG tactique : 260 quêtes, 120 donjons, 30 métiers",
        theme_color: "#1a0f2e",
        background_color: "#0d0618",
        display: "standalone",
        orientation: "portrait",
        lang: "fr",
        categories: ["games", "entertainment"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: { port: 5173, host: true },
  build: { target: "esnext" },
});
