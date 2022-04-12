/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getHomePath: async (name: string) =>
    await ipcRenderer.invoke("getHomePath", name),
  getResourcePath: async (name: string) =>
    await ipcRenderer.invoke("getResourcePath", name),
  readFile: async (path: string) => await ipcRenderer.invoke("readFile", path),
  writeFile: async (path: string, data: string) =>
    await ipcRenderer.invoke("writeFile", path, data),
  runWebhook: async (url: string) =>
    await ipcRenderer.invoke("runWebhook", url),
  exec: async (cmd: string) => await ipcRenderer.invoke("exec", cmd),
  // launchAgent: async (action: string) =>
  //   await ipcRenderer.invoke("launchAgent", action),
});
