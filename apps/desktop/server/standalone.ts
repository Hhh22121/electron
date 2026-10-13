import path from 'node:path';
import { startServer } from './main.js';

// Run the API without Electron: PORT=3000 DATA_FILE=./data/todos.json node dist/server/standalone.js
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
const dataFile = process.env.DATA_FILE ?? path.join(process.cwd(), 'data/todos.json');

const { url } = await startServer(dataFile, { port, host });
console.log(`API listening on ${url} (data: ${dataFile})`);
