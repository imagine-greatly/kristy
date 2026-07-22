// Pure unit test for the guest-continuity store (last N scans + goal + the replay
// hand-off that carries them into the account on sign-in). No backend, no browser —
// mocks localStorage. Run from client/:  node scripts/guestState.test.mjs

const store = new Map();
global.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const { recordGuestScan, recordGuestGoal, loadGuestState, hasGuestState, clearGuestState } =
  await import('../src/lib/guestState.js');

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}`);
  if (!cond) failures++;
};

check('empty state has no scans + no goal', loadGuestState().scans.length === 0 && loadGuestState().goal === null);
check('hasGuestState false when empty', hasGuestState() === false);

recordGuestScan({ product_name: 'A', tier: 'approved', barcode: '1' });
recordGuestScan({ product_name: 'B', tier: 'swap_recommended', barcode: '2' });
let st = loadGuestState();
check('two scans recorded, oldest first', st.scans.length === 2 && st.scans[0].product_name === 'A' && st.scans[1].product_name === 'B');
check('scan carries tier + barcode for replay', st.scans[1].tier === 'swap_recommended' && st.scans[1].barcode === '2');
check('hasGuestState true after a scan', hasGuestState() === true);

recordGuestScan({ product_name: 'ghost', tier: null }); // OFF miss / unreadable → not a product
check('tier-less scan is skipped', loadGuestState().scans.length === 2);

for (let i = 0; i < 20; i++) recordGuestScan({ product_name: `p${i}`, tier: 'approved' });
st = loadGuestState();
check('capped at the last 10 scans', st.scans.length === 10);
check('cap keeps the newest', st.scans[st.scans.length - 1].product_name === 'p19');

recordGuestGoal('high_protein');
check('goal recorded', loadGuestState().goal === 'high_protein');
check('recording a goal preserves scans', loadGuestState().scans.length === 10);

// The replay hand-off: every saved scan maps onto a saveHaulScan call, tier intact.
const posted = [];
const fakeSaveHaulScan = async (s) => posted.push(s);
const guest = loadGuestState();
for (const s of guest.scans) await fakeSaveHaulScan(s);
check('replay posts every saved scan', posted.length === guest.scans.length);
check('replay preserves tier for the Haul distribution', posted.every((p) => !!p.tier));

clearGuestState();
check('cleared: no scans', loadGuestState().scans.length === 0);
check('cleared: no goal', loadGuestState().goal === null);
check('hasGuestState false after clear', hasGuestState() === false);

global.localStorage.setItem('kristy:guest', '{not json');
check('corrupt state degrades to empty, never throws', loadGuestState().scans.length === 0 && loadGuestState().goal === null);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
