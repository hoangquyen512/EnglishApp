import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
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
    proxy: {
      "/lookup-dict": {
        target: "https://api.dictionaryapi.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lookup-dict/, ""),
      },
      "/lookup-wiki": {
        target: "https://en.wiktionary.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lookup-wiki/, ""),
      },
      "/lookup-translate": {
        target: "https://api.mymemory.translated.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lookup-translate/, ""),
      },
    },
  },
}));
