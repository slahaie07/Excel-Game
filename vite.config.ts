import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Aetheris — L'Éveil des Cristaux",
        short_name: "Aetheris",
        description: "MMORPG tactique mobile dans l'univers des Cristaux d'Aether",
        theme_color: "#1a0f2e",
        background_color: "#0d0618",
        display: "standalone",
        orientation: "portrait",
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
