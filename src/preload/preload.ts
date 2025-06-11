import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send("set-ignore-mouse-events", ignore),
  onSpotifyCallback: (callback: (data: { code: string; state: string }) => void) => {
    ipcRenderer.on("spotify-callback", (_, data) => callback(data));
  },
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
});
