# Electron + React + NestJS Todo

Simple desktop Todo app.

- **Electron** (`electron/`): main process boots the NestJS API, then opens the window. `preload.cts` exposes `window.api.getUrl()` to the renderer.
- **NestJS** (`server/`): REST API on a random port bound to `127.0.0.1`, prefix `/api`. Todos persist to `todos.json` in Electron's `userData` dir.
- **React + Vite** (`src/`): UI that calls the API with `fetch`.

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
npm run dev     # Vite HMR + tsc watch + Electron
npm start       # production build, then launch
npm test        # TodosService tests (node:test)
npm run typecheck
```

> If Electron starts as plain Node (`does not provide an export named 'BrowserWindow'`),
> your shell has `ELECTRON_RUN_AS_NODE=1` set (some VS Code terminals do). Run `unset ELECTRON_RUN_AS_NODE`.

Note: NestJS 12 is ESM-only, so the main process is ESM (`"type": "module"`); the preload stays CommonJS (`.cts`) because sandboxed preloads can't be ESM.
