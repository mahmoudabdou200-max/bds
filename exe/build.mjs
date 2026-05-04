import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const EXE_DIR = import.meta.dirname;
const EXE_NAME = 'Building Design Simulator.exe';

function readAllFiles(dir, baseDir = dir) {
  const files = {};
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      Object.assign(files, readAllFiles(fullPath, baseDir));
    } else {
      const relPath = '/' + relative(baseDir, fullPath).replace(/\\/g, '/');
      const content = readFileSync(fullPath);
      files[relPath] = content.toString('base64');
    }
  }
  return files;
}

function removeAuthenticodeSignature(exePath) {
  const buf = Buffer.from(readFileSync(exePath));
  const peOffset = buf.readUInt32LE(0x3C);
  const magic = buf.readUInt16LE(peOffset + 24);

  let certDirOffset;
  if (magic === 0x20B) {
    // PE32+ (64-bit)
    certDirOffset = peOffset + 24 + 112 + 32;
  } else {
    // PE32 (32-bit)
    certDirOffset = peOffset + 24 + 96 + 32;
  }

  const certAddr = buf.readUInt32LE(certDirOffset);
  const certSize = buf.readUInt32LE(certDirOffset + 4);

  if (certAddr > 0 && certSize > 0) {
    console.log(`  Found Authenticode signature: addr=0x${certAddr.toString(16)}, size=${certSize}`);
    buf.writeUInt32LE(0, certDirOffset);
    buf.writeUInt32LE(0, certDirOffset + 4);
    writeFileSync(exePath, buf);
    console.log('  Signature removed successfully');
  } else {
    console.log('  No Authenticode signature found, skipping');
  }
}

function findSentinelFuse(exePath) {
  const buf = readFileSync(exePath);
  const fuseStr = buf.toString('utf8').match(/NODE_SEA_FUSE_[a-f0-9]{32}/);
  if (fuseStr) {
    console.log(`  Found sentinel fuse: ${fuseStr[0]}`);
    return fuseStr[0];
  }
  throw new Error('Could not find NODE_SEA_FUSE sentinel in Node binary');
}

// Step 1: Generate self-contained server script
const files = readAllFiles(DIST_DIR);
console.log(`  Embedded ${Object.keys(files).length} files from dist/`);

const mimeMap = JSON.stringify({
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
  '.map': 'application/json',
});

const filesJson = JSON.stringify(files);

const serverCode = `const http = require('http');
const { exec } = require('child_process');

const MIME_MAP = ${mimeMap};
const FILES = ${filesJson};
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
  console.log('');
  console.log('  ========================================');
  console.log('    Building Design Simulator');
  console.log('    http://localhost:' + PORT);
  console.log('  ========================================');
  console.log('');
  console.log('  Opening browser...');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
  exec('start http://localhost:' + PORT);
});
`;

writeFileSync(join(EXE_DIR, 'server.cjs'), serverCode);
console.log('Created server.cjs (' + (serverCode.length / 1024).toFixed(0) + ' KB)');

// Step 2: Create SEA config
const seaConfig = {
  main: 'server.cjs',
  output: 'sea-prep.blob',
  disableExperimentalSEAWarning: true,
};
writeFileSync(join(EXE_DIR, 'sea-config.json'), JSON.stringify(seaConfig, null, 2));
console.log('Created sea-config.json');

// Step 3: Build SEA blob
console.log('\nBuilding SEA blob...');
execSync('node --experimental-sea-config sea-config.json', { cwd: EXE_DIR, stdio: 'inherit' });

// Step 4: Copy Node binary
const exePath = join(EXE_DIR, EXE_NAME);
console.log('\nCopying Node binary...');
const nodePath = process.execPath.replace(/\\/g, '\\\\');
execSync(`node -e "require('fs').copyFileSync(process.execPath, '${exePath.replace(/\\/g, '\\\\')}')"`, { cwd: EXE_DIR, stdio: 'inherit' });

// Step 5: Remove Authenticode signature (required on Windows)
console.log('\nRemoving Authenticode signature...');
removeAuthenticodeSignature(exePath);

// Step 6: Find the sentinel fuse and inject blob
console.log('\nInjecting SEA blob...');
const fuse = findSentinelFuse(exePath);
execSync(`npx postject "${EXE_NAME}" NODE_SEA_BLOB sea-prep.blob --sentinel-fuse ${fuse}`, { cwd: EXE_DIR, stdio: 'inherit' });

// Done
const size = statSync(exePath).size / 1024 / 1024;
console.log(`\nDone! EXE created: ${exePath}`);
console.log(`File size: ${size.toFixed(1)} MB`);
console.log('\nYou can now send this EXE to anyone - it runs standalone!');