import { app, BrowserWindow, net, protocol } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// The desktop app is a thin shell around apps/web; all data lives on the remote API (VITE_API_URL).
const RENDERER_DIR = path.join(import.meta.dirname, '../renderer');

// Serve the bundled web build from app://bundle/ instead of file:// so the page has a real origin (for CORS).
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Todo',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadURL('app://bundle/index.html');
  }
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const file = path.join(RENDERER_DIR, decodeURIComponent(new URL(req.url).pathname));
    if (!file.startsWith(RENDERER_DIR + path.sep)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
