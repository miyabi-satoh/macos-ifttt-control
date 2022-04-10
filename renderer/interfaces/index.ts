// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IpcRenderer } from "electron";
import { ApiResult } from "../../electron-src/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
  interface Window {
    api: {
      getHomePath: (name: string) => Promise<string>;
      getResourcePath: (name: string) => Promise<string>;
      getAppName: () => Promise<string>;
      readFile: (path: string) => Promise<ApiResult>;
      writeFile: (path: string, data: string) => Promise<ApiResult>;
      runWebhook: (url: string) => Promise<ApiResult>;
      exec: (cmd: string) => Promise<ApiResult>;
      // launchAgent: (action: string) => Promise<ApiResult>;
    };
  }
}

export type OptionProps = {
  value: string;
  text?: string;
};

export * from "../../electron-src/types";
