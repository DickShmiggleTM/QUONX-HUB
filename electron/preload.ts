import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';

contextBridge.exposeInMainWorld('fs', {
  readdir: (dirPath: string) => fs.promises.readdir(dirPath, { withFileTypes: true }),
  readFile: (filePath: string) => fs.promises.readFile(filePath, 'utf-8'),
  writeFile: (filePath: string, data: string) => fs.promises.writeFile(filePath, data, 'utf-8'),
  stat: (filePath: string) => fs.promises.stat(filePath),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args: string[]) => path.join(...args),
});

contextBridge.exposeInMainWorld('ipc', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
});
