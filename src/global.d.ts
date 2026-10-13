export {};

declare global {
  interface Window {
    api: { getUrl(): Promise<string> };
  }
}
