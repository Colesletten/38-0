/* Dev-only harness. The game itself is a single self-contained index.html with
   no build step; this just lifts its <script> out and runs the same runTests()
   in Node so the engine can be tuned without a browser in the loop.
   Usage:  node tools/run-tests.mjs  [extraExpression]                        */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('no <script> block found'); process.exit(1); }

const ctx = vm.createContext({ console, Math, Date, JSON, Number, String, Array, Object });
vm.runInContext(m[1], ctx, { filename: 'index.html' });

const ok = vm.runInContext('runTests()', ctx);

const extra = process.argv[2];
if (extra) {
  const out = vm.runInContext(extra, ctx);
  console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 2));
}
process.exit(ok ? 0 : 1);
