import 'reflect-metadata';
import { INestApplication, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Config } from './config.js';
import { runMigrations } from './db/db.module.js';

/** Builds the Nest app (shared by main.ts and the integration tests). Does not listen. */
export async function createApp(config: Config, logger: LogLevel[] = ['log', 'error', 'warn']): Promise<INestApplication> {
  await runMigrations(config.databaseUrl);
  const app = await NestFactory.create(AppModule.forRoot(config), { logger });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.corsOrigins });
  app.enableShutdownHooks();
  return app;
}
