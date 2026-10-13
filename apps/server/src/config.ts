export interface Config {
  port: number;
  host: string;
  databaseUrl: string;
  corsOrigins: string[];
}

export function loadConfig(env = process.env): Config {
  return {
    port: Number(env.PORT ?? 3100),
    host: env.HOST ?? '127.0.0.1',
    databaseUrl: env.DATABASE_URL ?? 'postgres://todo:todo@127.0.0.1:5433/todo',
    // Vite dev server and the Electron app (served from app://bundle) by default.
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173,app://bundle').split(',').map((o) => o.trim()),
  };
}
