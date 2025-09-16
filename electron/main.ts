import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import dotenv from 'dotenv';
import * as geminiService from '../services/geminiService';
import { ChatMessage, Agent, ModelProvider, SettingsState } from '../types';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

ipcMain.handle('chat:generate', async (
    event,
    prompt: string,
    history: ChatMessage[],
    agents: Agent[],
    provider: ModelProvider,
    settings: SettingsState
) => {
  try {
    const response = await geminiService.generateChatResponse(prompt, history, agents, provider, settings);
    return { success: true, response };
  } catch (error) {
    const err = error as Error;
    console.error('IPC Chat Generation Error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-directory-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
