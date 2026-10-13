import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getUrl: (): Promise<string> => ipcRenderer.invoke('api-url'),
});
