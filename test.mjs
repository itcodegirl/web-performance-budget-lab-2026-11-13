import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const copyLab = () => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-lab-'));
  cpSync(join(HERE, 'dist'), join(dir, 'dist'), { recursive: true });
  cpSync(join(HERE, 'extra'), join(dir, 'extra'), { recursive: true });
  cpSync(join(HERE, 'reference', 'check-bundle-budget.mjs'), join(dir, 'check-bundle-budget.mjs'));
  return dir;
};
const run = (dir) => spawnSync(process.execPath, ['check-bundle-budget.mjs'], { cwd: dir, encoding: 'utf8' });

test('the starter is within budget (exit 0)', () => {
  const dir = copyLab();
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Within budget/);
  rmSync(dir, { recursive: true });
});

test('adding the heavy library goes over budget (exit 1, names the overage)', () => {
  const dir = copyLab();
  cpSync(join(dir, 'extra', 'heavy-date-lib-1a2b3c4d.js'), join(dir, 'dist', 'assets', 'heavy-date-lib-1a2b3c4d.js'));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Over budget by \d+\.\d KB/);
  rmSync(dir, { recursive: true });
});

test('a missing build is a visible failure, not a stack trace', () => {
  const dir = copyLab();
  rmSync(join(dir, 'dist'), { recursive: true });
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No build output at dist\/assets/);
  rmSync(dir, { recursive: true });
});

test('serve.mjs serves the page on the PORT it is given and refuses path escapes', async () => {
  const port = 4300 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, ['serve.mjs'], { cwd: HERE, env: { ...process.env, PORT: String(port) } });
  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', (chunk) => String(chunk).includes('Serving dist') && resolve());
      child.on('error', reject);
      setTimeout(() => reject(new Error('server did not start')), 5000);
    });
    const page = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Budget lab/);
    const escape = await fetch(`http://127.0.0.1:${port}/..%2Fpackage.json`);
    assert.notEqual(escape.status, 200);
  } finally {
    child.kill();
  }
});

test('every file the lessons point at exists', () => {
  for (const file of ['reference/check-bundle-budget.mjs', 'reference/lighthouserc.json', 'reference/.github/workflows/performance-budget.yml', 'excerpts/platform-workflows.sanitized.yml', 'extra/heavy-date-lib-1a2b3c4d.js']) {
    assert.ok(existsSync(join(HERE, file)), file);
  }
});
