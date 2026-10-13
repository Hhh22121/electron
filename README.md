# Electron + React + NestJS Todo

Monorepo (npm workspaces):

```
apps/web/       React + Vite UI — plain web app, no Electron dependency
apps/desktop/   Electron + NestJS — the API runs inside Electron's main process
  electron/     main process + preload (exposes window.api.getUrl())
  server/       NestJS API (also runnable standalone via server/standalone.ts)
```

How the web app finds the API:
- **Inside Electron**: `window.api.getUrl()` → embedded server on a random `127.0.0.1` port.
- **In a browser**: `VITE_API_URL` (see `apps/web/.env.example`), default `http://127.0.0.1:3000/api`.

API:
```
GET    /api/todos
POST   /api/todos       { "title": "..." }
PATCH  /api/todos/:id   { "title"?: "...", "done"?: true }
DELETE /api/todos/:id
```

## Run

Requires Node 22+ (`nvm use`).

```bash
npm install
npm run dev           # desktop: Vite (web) + Electron with embedded API
npm run dev:browser   # browser: Vite (web) + standalone API on :3000 → open http://localhost:5173
npm run server        # standalone API only (PORT, HOST, DATA_FILE env vars)
npm start             # build web + desktop, launch Electron
npm test
npm run typecheck
```

Desktop data lives in `~/Library/Application Support/electron-nest-react-todo/todos.json` (macOS);
standalone server data defaults to `apps/desktop/data/todos.json`.

> If Electron starts as plain Node (`does not provide an export named 'BrowserWindow'`),
> your shell has `ELECTRON_RUN_AS_NODE=1` set (some VS Code terminals do). Run `unset ELECTRON_RUN_AS_NODE`.

Notes:
- NestJS 12 is ESM-only, so `apps/desktop` is ESM; the preload stays CommonJS (`.cts`) because sandboxed preloads can't be ESM.
- `apps/desktop` build copies `apps/web/dist` into `apps/desktop/dist/renderer`, which Electron loads via `file://`.
- The web CSP allows `127.0.0.1`/`localhost` plus the origin of `VITE_API_URL` at build time.
