import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const EXE_DIR = import.meta.dirname;

// Step 1: Read all dist files and create embedded-files.cjs
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

console.log('Embedding dist/ files...');
const files = readAllFiles(DIST_DIR);
console.log('  ' + Object.keys(files).length + ' files embedded');

writeFileSync(
  join(EXE_DIR, 'embedded-files.cjs'),
  'module.exports = ' + JSON.stringify(files) + ';\n'
);
console.log('  Created embedded-files.cjs');

// Step 2: Install pkg if needed
console.log('\nChecking for @yao-pkg/pkg...');
try {
  execSync('npx @yao-pkg/pkg --version', { cwd: EXE_DIR, stdio: 'pipe' });
} catch {
  console.log('  Installing @yao-pkg/pkg...');
  execSync('npm install @yao-pkg/pkg', { cwd: EXE_DIR, stdio: 'inherit' });
}

// Step 3: Build for all platforms
const platforms = [
  { target: 'node18-win-x64', suffix: 'Windows.exe' },
  { target: 'node18-macos-x64', suffix: 'macOS-Intel' },
  { target: 'node18-macos-arm64', suffix: 'macOS-AppleSilicon' },
  { target: 'node18-linux-x64', suffix: 'Linux' },
];

const exeName = 'Building Design Simulator';

for (const { target, suffix } of platforms) {
  const outName = `${exeName} - ${suffix}`;
  console.log(`\nBuilding for ${target}...`);
  try {
    execSync(
      `npx pkg server.cjs --target ${target} --output "${outName}" --public`,
      { cwd: EXE_DIR, stdio: 'inherit' }
    );
    const size = statSync(join(EXE_DIR, outName)).size / 1024 / 1024;
    console.log(`  Created: ${outName} (${size.toFixed(1)} MB)`);
  } catch (e) {
    console.log(`  FAILED: ${target} - ${e.message}`);
  }
}

console.log('\nDone! Binaries are in: ' + EXE_DIR);
console.log('\nTo share:');
console.log('  Windows: send "Building Design Simulator - Windows.exe"');
console.log('  Mac Intel: send "Building Design Simulator - macOS-Intel"');
console.log('  Mac M1/M2: send "Building Design Simulator - macOS-AppleSilicon"');
console.log('  Linux: send "Building Design Simulator - Linux"');