export interface Config {
  port: number;
  host: string;
  databaseUrl: string;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
}

export function loadConfig(env = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? (env.NODE_ENV === 'production' ? undefined : 'dev-secret-do-not-use-in-prod');
  if (!jwtSecret) throw new Error('JWT_SECRET must be set in production');

  return {
    port: Number(env.PORT ?? 3100),
    host: env.HOST ?? '127.0.0.1',
    databaseUrl: env.DATABASE_URL ?? 'postgres://todo:todo@127.0.0.1:5433/todo',
    // Vite dev server and the Electron app (served from app://bundle) by default.
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173,app://bundle').split(',').map((o) => o.trim()),
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '7d',
  };
}
