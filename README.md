# Electron + React + NestJS Todo

Client–server todo app with accounts: a NestJS API backed by Postgres, plus one React UI that runs both in the browser and inside an Electron desktop shell.

```
apps/server/    NestJS REST API + Postgres (Drizzle ORM), JWT auth
apps/web/       React + Vite UI, talks to the API at VITE_API_URL (baked in at build time)
apps/desktop/   Electron shell: serves the web build from app://bundle/, packaged with electron-builder
```

API (all routes except register/login need `Authorization: Bearer <token>`):
```
POST   /api/auth/register   { "email", "password" (≥ 8 chars) } → { token, user }
POST   /api/auth/login      { "email", "password" }             → { token, user }
GET    /api/auth/me
GET    /api/todos
POST   /api/todos           { "title": "..." }
PATCH  /api/todos/:id       { "title"?: "...", "done"?: true }
DELETE /api/todos/:id
```

## Develop

Requires Node 22+ (`nvm use`), Yarn 4 via Corepack (`corepack enable`), and Docker (for Postgres).

```bash
yarn install
yarn dev           # Postgres :5433 + API :3100 + Vite :5173 + Electron
yarn dev:browser   # Postgres + API + Vite → open http://localhost:5173
yarn start         # build everything, run API + Electron
yarn test          # API e2e tests against the todo_test database
yarn typecheck
```

Schema changes: edit `apps/server/src/db/schema.ts`, then `yarn workspace server db:generate --name <change>`.
Migrations in `apps/server/drizzle/` are applied automatically when the server starts.

> If Electron starts as plain Node (`does not provide an export named 'BrowserWindow'`),
> your shell has `ELECTRON_RUN_AS_NODE=1` set (some VS Code terminals do). Run `unset ELECTRON_RUN_AS_NODE`.

## Deploy

### 1. API + Postgres

Env vars (see `apps/server/.env.example`): `DATABASE_URL`, `JWT_SECRET` (required in production),
`JWT_EXPIRES_IN` (default `7d`), `PORT`, `HOST`, and `CORS_ORIGINS` — comma-separated browser origins allowed to
call the API. Keep `app://bundle` in it for the desktop app.

Whole stack on one VPS with Docker Compose:

```bash
JWT_SECRET=$(openssl rand -hex 32) CORS_ORIGINS=https://todo.example.com,app://bundle \
  docker compose --profile full up -d --build --wait
```

This publishes the API on host port `${SERVER_PORT:-3100}`. Put nginx/Caddy in front for HTTPS
(e.g. `https://api.todo.example.com` → `localhost:3100`), and change the Postgres password in `docker-compose.yml`
(and stop publishing port 5433) before going to production.
The server image alone: `docker build -f apps/server/Dockerfile -t todo-server .`

### 2. Web

```bash
VITE_API_URL=https://api.todo.example.com/api yarn workspace web build
```

Upload `apps/web/dist` to any static host (Vercel, Netlify, nginx). The CSP automatically allows the `VITE_API_URL` origin.

### 3. Desktop installers

```bash
VITE_API_URL=https://api.todo.example.com/api yarn dist:desktop
```

Output goes to `apps/desktop/release/` (`.dmg` on macOS; `.exe` / `.AppImage` must be built on Windows / Linux).
`.github/workflows/release.yml` builds all three and attaches them to a GitHub Release when you push a `v*` tag —
set the repository variable `VITE_API_URL` first.

Builds are **unsigned** (macOS gets an ad-hoc signature): macOS users must right-click → Open the first time, and
Windows shows a SmartScreen warning. Signing needs an Apple Developer ID / Windows code-signing certificate
(see electron-builder's code signing docs).

## Notes

- NestJS 12 is ESM-only, so the workspaces are ESM (`"type": "module"`).
- Yarn 4 quarantines very fresh package releases (supply-chain guard), so ranges are `^major.0.0` and resolve to the newest non-quarantined version.
- electron-builder needs an exact Electron version, so `electron` is pinned in `apps/desktop/package.json`.
- Auth uses a single long-lived access token stored in `localStorage`; there is no refresh token, password reset or rate limiting yet.
