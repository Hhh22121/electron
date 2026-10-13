export {};

declare global {
  interface Window {
    /** Present only inside Electron (exposed by the desktop preload). */
    api?: { getUrl(): Promise<string> };
  }
}
