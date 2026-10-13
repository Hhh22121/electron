import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// React Fast Refresh injects an inline preamble script in dev; allow it only for `vite serve`.
const devCsp = (): Plugin => ({
  name: 'dev-csp',
  apply: 'serve',
  transformIndexHtml: (html) => html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"),
});

export default defineConfig({
  plugins: [react(), devCsp()],
  base: './', // relative asset paths so index.html loads via file:// in production
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist/renderer', emptyOutDir: true },
});
