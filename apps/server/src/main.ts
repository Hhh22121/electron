import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = await createApp(config);
await app.listen(config.port, config.host);
console.log(`API listening on http://${config.host}:${config.port}/api (CORS: ${config.corsOrigins.join(', ')})`);
