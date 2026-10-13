import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AddressInfo } from 'node:net';
import { AppModule } from './app.module.js';

/** Boots the NestJS API. Defaults to a random free port bound to localhost only (embedded in Electron). */
export async function startServer(
  dataFile: string,
  { port = 0, host = '127.0.0.1' }: { port?: number; host?: string } = {},
): Promise<{ app: INestApplication; url: string }> {
  const app = await NestFactory.create(AppModule.forRoot(dataFile), { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true }); // renderer runs on http://localhost:5173 (dev) or file:// (prod)
  await app.listen(port, host);
  const { port: actualPort } = app.getHttpServer().address() as AddressInfo;
  return { app, url: `http://${host}:${actualPort}/api` };
}
