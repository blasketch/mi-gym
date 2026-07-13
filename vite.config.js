import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2019",
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    host: true,
  },
});
