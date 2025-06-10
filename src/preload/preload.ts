import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send("set-ignore-mouse-events", ignore),
  googleAuth: () => ipcRenderer.invoke("google-auth"),
  getEvents: () => ipcRenderer.invoke("get-calendar-events"),
});
