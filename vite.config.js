import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        game: fileURLToPath(new URL("./index.html", import.meta.url)),
        ui: fileURLToPath(new URL("./ui.html", import.meta.url)),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false,
  },
});
