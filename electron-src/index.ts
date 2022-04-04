// Native
import { join } from "path";
import { format } from "url";
import fs from "fs";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";

let mainWindow: BrowserWindow | null = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: false,
      // contextIsolation: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  const url = isDev
    ? "http://localhost:8000/"
    : format({
        pathname: join(__dirname, "../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.loadURL(url);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
// Prepare the renderer once the app is ready
// app.on("ready", async () => {
//   await prepareNext("./renderer");

//   createWindow();
// });
app.whenReady().then(async () => {
  await prepareNext("./renderer");

  createWindow();
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.handle("message", (_event: IpcMainInvokeEvent, message: any) => {
  console.log(message);
  // setTimeout(() => event.sender.send("message", "hi from electron"), 500);
  return "hi from electron";
});

ipcMain.handle("getAppName", (_event: IpcMainInvokeEvent) => {
  return `${app.getName()} v${app.getVersion()}`;
});

ipcMain.handle("getConfig", (_event: IpcMainInvokeEvent) => {
  // Get config
  const config_file = join(process.env.HOME!, "/.mic_config.json");
  try {
    if (fs.existsSync(config_file)) {
      const config_rawdata = fs.readFileSync(config_file, "utf-8");
      return JSON.parse(config_rawdata);
    }
  } catch (err) {
    console.error("getConfig::err", err);
  }

  return {
    hash: "",
    public_link: "",
  };
});
