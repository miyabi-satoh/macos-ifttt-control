// Native
import { join } from "path";
import { format } from "url";
import fs from "fs";
import { execSync } from "child_process";
import fetch from "node-fetch";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { ApiResult, Config } from "./types";

const HomePath = app.getPath("home");
const getResourcePath = (name: string) =>
  join(__dirname, "../resources", name).replace("app.asar/resources", "app");

// const DesktopPath = app.getPath("desktop");
const ConfigFilePath = join(HomePath, ".mic_config.json");
// const iconsFilePath = join(__dirname, "../resources/json/icons.json");

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

ipcMain.handle("getConfigPath", (_event: IpcMainInvokeEvent, name: string) => {
  return join(HomePath, name);
});

ipcMain.handle(
  "getResourcePath",
  (_event: IpcMainInvokeEvent, name: string) => {
    // return join(ResourcePath, name);
    return getResourcePath(name);
  }
);

ipcMain.handle("getAppName", (_event: IpcMainInvokeEvent) => {
  console.log("Called getAppName");
  return `${app.getName()} v${app.getVersion()}`;
});

ipcMain.handle(
  "writeFile",
  (_event: IpcMainInvokeEvent, path: string, data: string) => {
    const res: ApiResult = {
      success: false,
      message: "",
      data: "",
    };

    try {
      fs.writeFileSync(path, data);
      res.success = true;
    } catch (e: unknown) {
      console.log(e);
      res.message = e instanceof Error ? e.message : "Unknown error.";
    }

    return res;
  }
);

ipcMain.handle("readFile", (_event: IpcMainInvokeEvent, path: string) => {
  const res: ApiResult = {
    success: false,
    message: "",
    data: "",
  };

  try {
    if (fs.existsSync(path)) {
      res.data = fs.readFileSync(path, "utf-8");
    }
    res.success = true;
  } catch (e: unknown) {
    console.log(e);
    res.message = e instanceof Error ? e.message : "Unknown error.";
  }

  return res;
});

ipcMain.handle(
  "runWebhook",
  async (_event: IpcMainInvokeEvent, url: string) => {
    const res: ApiResult = {
      success: false,
      message: "",
      data: "",
    };

    try {
      const response = await fetch(url);
      // , {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({}),
      // });
      if (response.ok) {
        res.success = true;
        res.message = await response.text();
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
      res.message = e instanceof Error ? e.message : "Unknown error.";
    }

    return res;
  }
);

ipcMain.handle("doInstall", (_event: IpcMainInvokeEvent, config: Config) => {
  const res: ApiResult = {
    success: false,
    message: "",
    data: "",
  };

  try {
    // Validate Dropbox url
    if (
      !validateUrl(config.public_link) ||
      !config.public_link.includes("dropbox.com")
    ) {
      throw new Error("The entered Dropbox URL it's invalid.");
    }

    // Delete hash file
    // if (fs.existsSync(join(DesktopPath, config.hash))) {
    //   fs.unlinkSync(join(DesktopPath, config.hash));
    // }

    // Save the config file
    const json = JSON.stringify(config);
    fs.writeFileSync(ConfigFilePath, json);

    // Register the service daemon
    // const daemon_file = join(
    //   __dirname,
    //   "cli/daemon/com.amiiby.macosiftttcontrol.plist"
    // );
    const daemon_file = getResourcePath(
      "cli/daemon/com.amiiby.macosiftttcontrol.plist"
    );
    const library_path = join(
      HomePath,
      "Library/LaunchAgents/com.amiiby.macosiftttcontrol.plist"
    );
    execSync(`cp "${daemon_file}" "${library_path}"`);
    execSync(`launchctl load ${library_path}`);

    res.success = true;
  } catch (e: unknown) {
    console.log(e);
    res.message = e instanceof Error ? e.message : "Unknown error.";
  }

  return res;
});

/**
 * Validates a given URL
 */
function validateUrl(url: string) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(url);
}
