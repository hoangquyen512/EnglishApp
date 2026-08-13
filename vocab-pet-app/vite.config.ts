import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWebBuild = mode === "web";

  return {
    base: isWebBuild ? "./" : "/",
    plugins: [
      react(),
      tailwindcss(),
      isWebBuild
        ? VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            includeAssets: ["pwa-192.png", "pwa-512.png"],
            manifest: {
              name: "Vocab Pet",
              short_name: "Vocab Pet",
              description: "Daily vocabulary flashcards with a virtual pet",
              theme_color: "#4338ca",
              background_color: "#eef2ff",
              display: "standalone",
              orientation: "portrait",
              start_url: "./",
              icons: [
                {
                  src: "pwa-192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "pwa-512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
                {
                  src: "pwa-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
            },
          })
        : undefined,
    ].filter(Boolean),

    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || true,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  };
});
