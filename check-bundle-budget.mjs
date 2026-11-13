import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = 'dist/assets';   // where the build wrote its files; change it for another build tool
const BUDGET_KB = 220;

let files;
try {
  files = await readdir(DIST);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.error(`No build output at ${DIST}. Run this from the project root, after the production build.`);
  process.exit(1);
}

const scripts = files.filter((file) => file.endsWith('.js'));
if (scripts.length === 0) {
  console.error(`No .js files in ${DIST}, so there is nothing to measure.`);
  process.exit(1);
}

let totalBytes = 0;
for (const file of scripts) {
  const raw = await readFile(join(DIST, file));
  totalBytes += gzipSync(raw).length;   // reproducible local gzip-size proxy
}
const totalKb = totalBytes / 1024;
console.log(`Total JS gzip proxy: ${totalKb.toFixed(1)} KB (budget ${BUDGET_KB} KB)`);

if (totalKb > BUDGET_KB) {
  console.error(`Over budget by ${(totalKb - BUDGET_KB).toFixed(1)} KB`);
  process.exit(1);
}
console.log('Within budget');
