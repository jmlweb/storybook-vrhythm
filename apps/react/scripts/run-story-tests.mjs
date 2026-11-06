// Vitest stays green when a story file yields no tests, as long as another file
// runs, so a file that fails discovery would silently stop being tested.
import { spawnSync } from 'node:child_process';
import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RESULTS_FILE = 'node_modules/.vitest-results.json';
const EXCLUDED_FROM_TESTS = /['"]!test['"]/;

const { error, status } = spawnSync(
  'vitest',
  [
    'run',
    '--reporter=default',
    '--reporter=json',
    `--outputFile=${RESULTS_FILE}`,
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' }
);

if (error) {
  console.error(`Could not start vitest: ${error.message}. Use pnpm test.`);
  process.exit(1);
}
if (status !== 0) {
  process.exit(status ?? 1);
}

const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
const testCounts = new Map(
  results.testResults.map(({ name, assertionResults }) => [
    name,
    assertionResults.length,
  ])
);
// A file left out by a filter has no entry, so only a real 0 counts.
const untested = globSync('src/**/*.stories.{ts,tsx}').filter(
  (file) =>
    testCounts.get(resolve(file)) === 0 &&
    !EXCLUDED_FROM_TESTS.test(readFileSync(file, 'utf8'))
);

if (untested.length > 0) {
  console.error(`No tests ran for:\n  ${untested.join('\n  ')}`);
  process.exit(1);
}
