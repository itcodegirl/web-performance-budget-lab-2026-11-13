# Budget lab (teaching repository)

A tiny, dependency-free project for the Web Performance budget lessons (5-1 and 5-1b). It holds fake build output, not
real library code, so the numbers are stable and nothing needs installing. You need Node 20 or newer (`node -v`).

| Path | What it is |
|---|---|
| `dist/` | Pretend production build: `index.html` and three scripts in `dist/assets` (about 195 KB gzipped in total). |
| `extra/heavy-date-lib-1a2b3c4d.js` | The "teammate's change": a heavy library nobody budgeted for. Copy it into `dist/assets` to simulate the pull request. |
| `serve.mjs` | Serves `dist` on `http://127.0.0.1:4180`. Set `PORT` to change it. |
| `reference/` | A known-working copy of every file you write in the lessons: the budget script, `lighthouserc.json`, and the workflow. Compare after you try. |
| `excerpts/platform-workflows.sanitized.yml` | A sanitized excerpt of a real repository's workflows, for reading practice. |
| `generate-dist.mjs` | Regenerates `dist/` and `extra/` identically on any machine. |

## Run it

Open a terminal in this folder. In Windows, use PowerShell (File Explorer: open the folder, then File > Open Windows
PowerShell). On macOS or Linux use any terminal.

```text
node serve.mjs
```

Open `http://127.0.0.1:4180`. Stop with `Ctrl+C`. To use another port:

- PowerShell: `$env:PORT = 4181; node serve.mjs`
- macOS / Linux: `PORT=4181 node serve.mjs`

Known working check: copy `reference/check-bundle-budget.mjs` into this folder and run `node check-bundle-budget.mjs`.
Expected output: `Total JS gzip proxy: 194.6 KB (budget 220 KB)` then `Within budget`, exit code 0. After copying
`extra/heavy-date-lib-1a2b3c4d.js` into `dist/assets`, expected: about 275.6 KB, `Over budget by 55.6 KB`, exit code 1.

Self-check for this folder: `node --test test.mjs`.

## What this is not

Real projects build with a tool such as Vite and put the output in `dist/assets`; this folder skips that so the lesson can
focus on the budget. No real employer or client code is in it.

Performance budgets are checked on pull requests.
