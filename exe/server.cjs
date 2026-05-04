const http = require('http');
const { exec } = require('child_process');
const FILES = require('./embedded-files.cjs');

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.map': 'application/json',
};

const PORT = 8080;

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';

  const content = FILES[url];
  if (!content) {
    if (url !== '/index.html') {
      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = url.substring(url.lastIndexOf('.'));
  const contentType = MIME_MAP[ext] || 'application/octet-stream';
  const buf = Buffer.from(content, 'base64');

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': buf.length,
    'Cache-Control': 'no-cache',
  });
  res.end(buf);
});

server.listen(PORT, () => {
  const url = 'http://localhost:' + PORT;
  console.log('');
  console.log('  ========================================');
  console.log('    Building Design Simulator');
  console.log('    ' + url);
  console.log('  ========================================');
  console.log('');
  console.log('  Opening browser...');
  console.log('  Press Ctrl+C to stop.');
  console.log('');

  const cmd = process.platform === 'win32' ? 'start ' + url
    : process.platform === 'darwin' ? 'open ' + url
    : 'xdg-open ' + url;
  exec(cmd, (err) => {
    if (err) console.log('  Could not auto-open browser. Open this URL manually: ' + url);
  });
});