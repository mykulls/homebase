import { defineConfig } from "electron-vite";
import { join } from "path";

export default defineConfig({
  preload: {
    build: {
      lib: {
        entry: join(__dirname, "src/preload/preload.ts"),
      },
    },
  },
  main: {
    build: {
      lib: {
        entry: join(__dirname, "src/main/index.ts"),
      },
    },
  },
  // Optionally set renderer config if you're using one
  renderer: {
    // vite config for renderer
  },
});
