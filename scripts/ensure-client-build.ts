import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientIndexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');

if (existsSync(clientIndexPath)) {
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['--prefix', 'client', 'run', 'build'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
