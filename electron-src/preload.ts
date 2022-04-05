/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { Config } from "../renderer/interfaces";

// declare global {
//   namespace NodeJS {
//     interface Global {
//       ipcRenderer: IpcRenderer
//     }
//   }
// }

// Since we disabled nodeIntegration we can reintroduce
// needed node functionality here
// process.once('loaded', () => {
//   global.ipcRenderer = ipcRenderer
// })

contextBridge.exposeInMainWorld("api", {
  message: async (message: string) =>
    await ipcRenderer.invoke("message", message),
  getConfig: async () => await ipcRenderer.invoke("getConfig"),
  getAppName: async () => await ipcRenderer.invoke("getAppName"),
  createHashFile: async (hash: string) =>
    await ipcRenderer.invoke("createHashFile", hash),
  doInstall: async (config: Config) =>
    await ipcRenderer.invoke("doInstall", config),
});
