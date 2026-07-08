import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/client": { target: "http://localhost:8000", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/client/, "") },
      "/api/worker": { target: "http://localhost:8001", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/worker/, "") },
      "/api/verifier": { target: "http://localhost:8002", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/verifier/, "") },
      "/api/escrow": { target: "http://localhost:8003", changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/escrow/, "") },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
