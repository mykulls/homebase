import { app, components, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { createServer } from "http";

const devMode = true;
let mainWindow: BrowserWindow | null = null;

// Create HTTP server for Spotify callback
const server = createServer((req, res) => {
  if (req.url?.startsWith("/callback")) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    // Send the auth data to the renderer
    if (mainWindow && code && state) {
      mainWindow.webContents.send("spotify-callback", { code, state });
    }

    // Send a response to close the window
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<script>window.close()</script>");
  } else {
    res.writeHead(404);
    res.end();
  }
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
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

  // Start the server on port 3000
  server.listen(3000, () => {
    console.log("Callback server listening on port 3000");
  });

  // win.setBackgroundMaterial("acrylic");

  mainWindow.loadFile(join(__dirname, "../renderer/index.html"));

  if (devMode) {
    mainWindow.webContents.openDevTools();
  } else {
    // Ignore all mouse events initially
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // Listen to toggle when mouse is over a clickable area
    ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
      mainWindow?.setIgnoreMouseEvents(ignore, { forward: true });
    });
  }
};

// Add handler for opening URLs in default browser
ipcMain.on("open-external", (_, url) => {
  shell.openExternal(url);
});

// Clean up server on app quit
app.on("will-quit", () => {
  server.close();
});

app.whenReady().then(async () => {
  await components.whenReady();
  console.log("components ready:", components.status());
  createWindow();
});
