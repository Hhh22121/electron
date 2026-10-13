import { app, BrowserWindow, ipcMain } from 'electron';
import type { INestApplication } from '@nestjs/common';
import path from 'node:path';
import { startServer } from '../server/main.js';

// Pin the data dir so it doesn't follow the workspace package name ("desktop").
app.setPath('userData', path.join(app.getPath('appData'), 'electron-nest-react-todo'));

let server: INestApplication | undefined;
let apiUrl = '';

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Todo',
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  const started = await startServer(path.join(app.getPath('userData'), 'todos.json'));
  server = started.app;
  apiUrl = started.url;
  ipcMain.handle('api-url', () => apiUrl);

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  server?.close();
});
