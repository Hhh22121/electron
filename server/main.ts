import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AddressInfo } from 'node:net';
import { AppModule } from './app.module.js';

/** Boots the NestJS API on a random free port bound to localhost only. */
export async function startServer(dataFile: string): Promise<{ app: INestApplication; url: string }> {
  const app = await NestFactory.create(AppModule.forRoot(dataFile), { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true }); // renderer runs on http://localhost:5173 (dev) or file:// (prod)
  await app.listen(0, '127.0.0.1');
  const { port } = app.getHttpServer().address() as AddressInfo;
  return { app, url: `http://127.0.0.1:${port}/api` };
}
