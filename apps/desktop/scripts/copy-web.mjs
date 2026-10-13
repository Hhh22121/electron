// Copies the built web app (apps/web/dist) into dist/renderer so Electron can load it via file://.
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const src = path.join(root, '../web/dist');
const dest = path.join(root, 'dist/renderer');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error(`Missing ${src}/index.html — run "npm -w web run build" first.`);
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied web build -> ${path.relative(process.cwd(), dest)}`);
