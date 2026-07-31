// Playwright + esbuild, resolved at runtime with an actionable failure.
//
// Both live in `.ds-sync/node_modules`, which is GITIGNORED — it is a local tooling
// directory, not a dependency of this repo. A static import of a path that does not exist
// on a fresh clone fails with a bare ERR_MODULE_NOT_FOUND naming a path nobody recognises.
// Resolving here turns that into one sentence saying what to install.
//
// These are the only two things standing between "the card is three lines" as an opinion
// and as a measurement, so the message matters more than the tidiness of the import.

const CANDIDATES = (pkg) => [
  // The local tooling install, the usual case on this machine.
  new URL(`../../.ds-sync/node_modules/${pkg}`, import.meta.url).href,
  // A normal install, if anyone ever adds these as real devDependencies.
  pkg,
];

async function resolve(pkg, subpath) {
  const errors = [];
  for (const base of CANDIDATES(pkg)) {
    const target = base.startsWith('file:') ? `${base}/${subpath}` : pkg;
    try {
      return await import(target);
    } catch (err) {
      errors.push(`${target}: ${err.code || err.message}`);
    }
  }
  console.error(
    `\n✗ could not load ${pkg}.\n` +
      `  These tests drive a real browser, which is the whole point — a rendered line count\n` +
      `  cannot be derived from the data. Install it with:\n\n` +
      `      npm i -D ${pkg}\n\n` +
      `  or run from a checkout that has .ds-sync/node_modules populated.\n` +
      `  Tried:\n    ${errors.join('\n    ')}\n`
  );
  process.exit(2);
}

const playwright = await resolve('playwright', 'index.mjs');
const esbuild = await resolve('esbuild', 'lib/main.js');

export const chromium = playwright.chromium;
export const build = esbuild.build;
