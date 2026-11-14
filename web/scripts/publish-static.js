import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../dist-server/entry-server.js';
const web = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(web, '..');
for (const [file, personal] of [['index.html', false], ['personal/index.html', true]]) {
  const input = await fs.readFile(path.join(web, 'dist', file), 'utf8');
  if (!input.includes('<!--app-html-->')) throw new Error('Missing prerender slot');
  await fs.writeFile(path.join(repo, file), input.replace('<!--app-html-->', () => render(personal)));
}
// Replace only this build's generated bundles. Stable PDFs, photos, other pages stay intact.
await fs.rm(path.join(repo, 'assets/app'), { recursive: true, force: true });
await fs.cp(path.join(web, 'dist/assets/app'), path.join(repo, 'assets/app'), { recursive: true });
console.log('Published prerendered home and personal pages into the repository root.');
