// Regenerates dist/ and extra/. dist/ is committed so learners need no build step.
// Seeded, so output is identical on every machine. The files are valid JavaScript
// whose bodies are filler data: this fixture teaches budgets, not bundling.
import { mkdirSync, writeFileSync } from 'node:fs';

function filler(seed, bytes) {
  let s = seed >>> 0;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  while (out.length < bytes) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out += alphabet[s >>> 26];
  }
  return out;
}
const asModule = (name, seed, bytes) =>
  `// ${name} (synthetic filler, not real library code)\nexport const ${name.replace(/\W/g, '_')} = "${filler(seed, bytes)}";\n`;

mkdirSync('dist/assets', { recursive: true });
mkdirSync('extra', { recursive: true });
writeFileSync('dist/assets/index-3f9a2c1d.js',
  `import { vendor } from './vendor-8b41e07a.js';\nconsole.log('budget-lab app', vendor.length);\n` + asModule('app', 1, 52000));
writeFileSync('dist/assets/vendor-8b41e07a.js', asModule('vendor', 2, 150000));
writeFileSync('dist/assets/chart-c70d5e92.js', asModule('chart', 3, 62000));
// The teammate's pull request: a heavy date library nobody budgeted for.
writeFileSync('extra/heavy-date-lib-1a2b3c4d.js', asModule('heavyDateLib', 4, 110000));
