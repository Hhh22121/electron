# Electron + React + NestJS Todo

Client–server app: a NestJS API you deploy to a server, plus one React UI that runs both in the browser and inside an Electron desktop shell.

```
apps/server/    NestJS REST API (deploy to a VPS / Docker)
apps/web/       React + Vite UI, talks to the API at VITE_API_URL (baked in at build time)
apps/desktop/   Electron shell: serves the web build from app://bundle/, no backend inside
```

API:
```
GET    /api/todos
POST   /api/todos       { "title": "..." }
PATCH  /api/todos/:id   { "title"?: "...", "done"?: true }
DELETE /api/todos/:id
```

## Develop

Requires Node 22+ (`nvm use`) and Yarn 4 via Corepack (`corepack enable`; version pinned in `packageManager`).

```bash
yarn install
yarn dev           # server :3100 + Vite :5173 + Electron
yarn dev:browser   # server :3100 + Vite :5173 → open http://localhost:5173
yarn start         # build everything, run server + Electron
yarn test
yarn typecheck
```

> If Electron starts as plain Node (`does not provide an export named 'BrowserWindow'`),
> your shell has `ELECTRON_RUN_AS_NODE=1` set (some VS Code terminals do). Run `unset ELECTRON_RUN_AS_NODE`.

## Deploy

### 1. Server

Env vars (see `apps/server/.env.example`): `PORT` (default 3100), `HOST`, `DATA_FILE`, and
`CORS_ORIGINS` — comma-separated browser origins allowed to call the API. Keep `app://bundle` in it for the desktop app.

```bash
docker build -f apps/server/Dockerfile -t todo-server .
docker run -d --restart unless-stopped -p 3000:3000 -v todo-data:/data \
  -e CORS_ORIGINS=https://todo.example.com,app://bundle todo-server
```

Put nginx/Caddy in front for HTTPS (e.g. `https://api.todo.example.com` → `localhost:3000`).
Data is a JSON file on the `/data` volume — fine for a demo; switch to a real database before multiple users rely on it.

### 2. Web

```bash
VITE_API_URL=https://api.todo.example.com/api yarn workspace web build
```

Upload `apps/web/dist` to any static host (Vercel, Netlify, nginx). The CSP automatically allows the `VITE_API_URL` origin.

### 3. Desktop

Build the web app with the production `VITE_API_URL` first, then build the desktop shell (it copies `apps/web/dist`):

```bash
VITE_API_URL=https://api.todo.example.com/api yarn workspace web build
yarn workspace desktop build
```

Packaging into `.dmg` / `.exe` installers (electron-builder) is not set up yet.

## Notes

- NestJS 12 is ESM-only, so the workspaces are ESM (`"type": "module"`).
- Yarn 4 quarantines very fresh package releases (supply-chain guard), so ranges are `^major.0.0` and resolve to the newest non-quarantined version.
