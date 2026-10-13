import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import path from 'node:path';
import { AppModule } from './app.module.js';

const port = Number(process.env.PORT ?? 3100);
const host = process.env.HOST ?? '127.0.0.1';
const dataFile = process.env.DATA_FILE ?? path.join(process.cwd(), 'data/todos.json');
// Vite dev server and the Electron app (served from app://bundle) by default.
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,app://bundle').split(',').map((o) => o.trim());

const app = await NestFactory.create(AppModule.forRoot(dataFile), { logger: ['log', 'error', 'warn'] });
app.setGlobalPrefix('api');
app.enableCors({ origin: corsOrigins });
app.enableShutdownHooks();
await app.listen(port, host);
console.log(`API listening on http://${host}:${port}/api (data: ${dataFile}, CORS: ${corsOrigins.join(', ')})`);
