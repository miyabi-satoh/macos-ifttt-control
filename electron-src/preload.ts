/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { Config } from "./types";

contextBridge.exposeInMainWorld("api", {
  getConfigPath: async (name: string) =>
    await ipcRenderer.invoke("getConfigPath", name),
  getResourcePath: async (name: string) =>
    await ipcRenderer.invoke("getResourcePath", name),
  getAppName: async () => await ipcRenderer.invoke("getAppName"),
  readFile: async (path: string) => await ipcRenderer.invoke("readFile", path),
  writeFile: async (path: string, data: string) =>
    await ipcRenderer.invoke("writeFile", path, data),
  runWebhook: async (url: string) =>
    await ipcRenderer.invoke("runWebhook", url),
  doInstall: async (config: Config) =>
    await ipcRenderer.invoke("doInstall", config),
});
