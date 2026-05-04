import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');
let html = readFileSync(join(distDir, 'index.html'), 'utf8');

html = html.replace(/ crossorigin/g, '');
html = html.replace(' type="module"', '');
html = html.replace(/<script src=/g, '<script defer src=');

writeFileSync(join(distDir, 'index.html'), html, 'utf8');
console.log('Fixed index.html for static deployment');