import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Adjusts the CSP in index.html:
 * - dev: allow React Fast Refresh's inline preamble script;
 * - any mode: allow fetches to VITE_API_URL's origin (e.g. a remotely hosted API).
 */
const csp = (mode: string): Plugin => {
  const apiUrl = loadEnv(mode, process.cwd()).VITE_API_URL;
  return {
    name: 'csp',
    transformIndexHtml(html, ctx) {
      if (ctx.server) html = html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'");
      if (apiUrl) html = html.replace("connect-src 'self'", `connect-src 'self' ${new URL(apiUrl).origin}`);
      return html;
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), csp(mode)],
  base: './', // relative asset paths so index.html loads via file:// inside Electron
  server: { port: 5173, strictPort: true },
}));
