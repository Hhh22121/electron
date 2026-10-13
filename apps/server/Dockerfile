# Build from the repo root:  docker build -f apps/server/Dockerfile -t todo-server .
# Needs DATABASE_URL at runtime; pending migrations are applied on startup.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY apps/desktop/package.json apps/desktop/
RUN yarn workspaces focus server
COPY apps/server apps/server
RUN yarn workspace server build && yarn workspaces focus server --production

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/server/package.json ./
COPY --from=build /repo/apps/server/dist ./dist
COPY --from=build /repo/apps/server/drizzle ./drizzle
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
