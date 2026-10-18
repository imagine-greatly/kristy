// THE TWO-LINE RULE (docs/CARD-STYLE-SAMPLES.md), pinned. Shop mode shows a shopper
// `decision` and `look_for[0]` and nothing else, so every card must keep line 2 out of
// splitTips' watch_out and both lines inside their lengths. scripts/twoLineCheck.js holds
// the rules (it also runs lintCard); this test makes a red there a red here.
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('every card passes the two-line rule', () => {
  const r = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/twoLineCheck.js', import.meta.url))], { encoding: 'utf8' });
  const last = r.stdout.trim().split('\n').pop();
  assert.match(last, /^(\d+) checked, 0 with violations$/, r.stdout.slice(-2000));
  assert.ok(Number(last.split(' ')[0]) >= 150, `checked too few cards: ${last}`);
  assert.strictEqual(r.status, 0);
});
