import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { authenticateWithGoogle, getCalendarEvents } from "./auth/google";

const devMode = true;

ipcMain.handle("google-auth", async () => {
  return await authenticateWithGoogle();
});

ipcMain.handle("get-calendar-events", async () => {
  return await getCalendarEvents();
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 2560,
    height: 1440,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"), // compiled path
      contextIsolation: true,
      nodeIntegration: false,
      allowRunningInsecureContent: true,
    },
  });

  // win.setBackgroundMaterial("acrylic");

  win.loadFile(join(__dirname, "../renderer/index.html"));

  if (devMode) {
    win.webContents.openDevTools();
  } else {
    // Ignore all mouse events initially
    win.setIgnoreMouseEvents(true, { forward: true });

    // Listen to toggle when mouse is over a clickable area
    ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
      win.setIgnoreMouseEvents(ignore, { forward: true });
    });
  }
};

app.whenReady().then(() => {
  createWindow();
});
