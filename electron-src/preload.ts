/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { Config } from "./types";

contextBridge.exposeInMainWorld("api", {
  message: async (message: string) =>
    await ipcRenderer.invoke("message", message),
  getConfig: async () => await ipcRenderer.invoke("getConfig"),
  getAppName: async () => await ipcRenderer.invoke("getAppName"),
  getIcons: async () => await ipcRenderer.invoke("getIcons"),
  // createHashFile: async (hash: string) =>
  //   await ipcRenderer.invoke("createHashFile", hash),
  doInstall: async (config: Config) =>
    await ipcRenderer.invoke("doInstall", config),
});
