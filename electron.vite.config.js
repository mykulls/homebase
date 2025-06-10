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
  renderer: {
    define: {
      "process.env": {},
      "process.platform": JSON.stringify(process.platform),
      "process.version": JSON.stringify(process.version),
    },
    resolve: {
      alias: {
        electron: join(__dirname, "src/renderer/electron-mock.ts"),
      },
    },
  },
});
