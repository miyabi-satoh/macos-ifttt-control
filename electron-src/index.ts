// Native
import { join } from "path";
import { format } from "url";
import fs from "fs";
import { spawnSync } from "child_process";
import fetch from "node-fetch";

// Packages
import {
  BrowserWindow,
  app,
  ipcMain,
  IpcMainInvokeEvent,
  Menu,
} from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { ApiResult } from "./types";

const HomePath = app.getPath("home");
const getResourcePath = (name: string) =>
  join(__dirname, "../resources", name).replace("app.asar/resources", "app");

let mainWindow: BrowserWindow | null = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 800,
    height: 600,
    webPreferences: {
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

const template = Menu.buildFromTemplate([
  {
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" },
      { type: "separator" },
      {
        label: "Speech",
        submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
      },
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
      { type: "separator" },
      { role: "window" },
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: () => {
          spawnSync(
            "open https://github.com/miyabi-satoh/macos-ifttt-control/wiki",
            { shell: true }
          );
        },
      },
    ],
  },
]);
Menu.setApplicationMenu(template);

// Prepare the renderer once the app is ready
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

ipcMain.handle("getHomePath", (_event: IpcMainInvokeEvent, name: string) => {
  return join(HomePath, name);
});

ipcMain.handle(
  "getResourcePath",
  (_event: IpcMainInvokeEvent, name: string) => {
    return getResourcePath(name);
  }
);

ipcMain.handle("getAppName", (_event: IpcMainInvokeEvent) => {
  return `${app.getName()} v${app.getVersion()}`;
});

const apiResultDefault: ApiResult = {
  status: 1,
  stderr: "",
  stdout: "",
} as const;

ipcMain.handle(
  "writeFile",
  (_event: IpcMainInvokeEvent, path: string, data: string) => {
    const res = { ...apiResultDefault };

    try {
      fs.writeFileSync(path, data);
      res.status = 0;
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        res.error = e;
        res.stderr = e.message;
      } else {
        res.stderr = "Unknown error.";
      }
    }

    return res;
  }
);

ipcMain.handle("readFile", (_event: IpcMainInvokeEvent, path: string) => {
  const res = { ...apiResultDefault };

  try {
    if (fs.existsSync(path)) {
      res.stdout = fs.readFileSync(path, "utf-8");
    }
    res.status = 0;
  } catch (e: unknown) {
    console.log(e);
    if (e instanceof Error) {
      res.error = e;
      res.stderr = e.message;
    } else {
      res.stderr = "Unknown error.";
    }
  }

  return res;
});

ipcMain.handle(
  "runWebhook",
  async (_event: IpcMainInvokeEvent, url: string) => {
    const res = { ...apiResultDefault };

    try {
      const response = await fetch(url);
      // , {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({}),
      // });
      if (response.ok) {
        res.status = 0;
        res.stdout = await response.text();
      } else {
        const json = await response.json();
        const message = json.errors
          .map((err: { message: string }) => {
            console.log(err.message);
            return err.message;
          })
          .join("");
        console.log(message);
        throw new Error(message);
      }
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        res.error = e;
        res.stderr = e.message;
      } else {
        res.stderr = "Unknown error.";
      }
    }

    return res;
  }
);

ipcMain.handle("exec", (_event: IpcMainInvokeEvent, cmd: string) => {
  const res = { ...apiResultDefault };

  const spawn = spawnSync(cmd, { shell: true });
  res.status = spawn.status;
  res.stdout = spawn.stdout.toString();
  res.stderr = spawn.stderr.toString();
  res.error = spawn.error;

  return res;
});
