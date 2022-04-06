// Native
import { join } from "path";
import { format } from "url";
import fs from "fs";
import { execSync } from "child_process";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { Config } from "./types";

const HomePath = app.getPath("home");
// const DesktopPath = app.getPath("desktop");
const ConfigFilePath = join(HomePath, ".mic_config.json");
const iconsFilePath = join(__dirname, "../resources/json/icons.json");

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
  console.log("Called getAppName");
  return `${app.getName()} v${app.getVersion()}`;
});

ipcMain.handle("getConfig", (_event: IpcMainInvokeEvent) => {
  console.log("Called getConfig");
  // Get config
  try {
    if (fs.existsSync(ConfigFilePath)) {
      const config_rawdata = fs.readFileSync(ConfigFilePath, "utf-8");
      return JSON.parse(config_rawdata);
    }
  } catch (err) {
    console.error("getConfig::err", err);
  }

  return {
    // hash: "",
    public_link: "",
  };
});

ipcMain.handle("getIcons", (_event: IpcMainInvokeEvent) => {
  // Get icons
  try {
    if (fs.existsSync(iconsFilePath)) {
      const config_rawdata = fs.readFileSync(iconsFilePath, "utf-8");
      return JSON.parse(config_rawdata);
    }
  } catch (err) {
    console.error("getIcons::err", err);
  }

  return [];
});

// ipcMain.handle("createHashFile", (_event: IpcMainInvokeEvent, hash: string) => {
//   // Create the file with the hash as name
//   try {
//     console.log(`createHashFile: ${hash}`);
//     fs.writeFileSync(join(DesktopPath, hash), hash);
//     return true;
//   } catch (err) {
//     console.log(err);
//   }
//   return false;
// });

ipcMain.handle("doInstall", (_event: IpcMainInvokeEvent, config: Config) => {
  let message = "";

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
    const daemon_file = join(
      __dirname,
      "cli/daemon/co.abdyfran.macosiftttcontrol.plist"
    );
    const library_path = join(
      HomePath,
      "Library/LaunchAgents/com.amiiby.macosiftttcontrol.plist"
    );
    execSync(`cp "${daemon_file}" "${library_path}"`);
    execSync(`launchctl load ${library_path}`);

    return {
      success: true,
      message: "success",
    };
  } catch (e: unknown) {
    console.log(e);
    message = e instanceof Error ? e.message : "Unknown error.";
  }

  return {
    success: false,
    message,
  };
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
