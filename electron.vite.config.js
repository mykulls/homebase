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
  renderer: {},
});
