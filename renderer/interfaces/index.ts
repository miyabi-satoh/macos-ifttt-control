// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IpcRenderer } from "electron";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
  interface Window {
    api: {
      message: (message: string) => Promise<string>;
      getConfig: () => Promise<Config>;
      getAppName: () => Promise<string>;
    };
  }
}

export type Config = {
  hash: string;
  public_link: string;
};

export type User = {
  id: number;
  name: string;
};
