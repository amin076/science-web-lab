import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(root, 'app');
const major = Number(process.versions.node.split('.')[0]);
const minor = Number(process.versions.node.split('.')[1]);
if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 24)) {
  throw new Error('Use Node 24 LTS, Node >=22.12 (22.x), or Node >=20.19 (20.x).');
}
if (existsSync(target)) {
  throw new Error('app already exists. Reuse it; bootstrap refuses to overwrite existing work.');
}
const args = ['--yes', '@iwsdk/create@latest', 'app', '--yes',
  '--target', 'vr', '--language', 'ts', '--no-git', '--no-install',
  '--no-physics', '--no-locomotion', '--grabbing', '--ai-tools', 'none'];
console.log('Creating official stationary VR starter; Rapier integration is a separate next step.');
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  args, { cwd: root, stdio: 'inherit', shell: false });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('Starter created. Next: cd experiments/esbiko-vr/app && npm install && npm run dev');
