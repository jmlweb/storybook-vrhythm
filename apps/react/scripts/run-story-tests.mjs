// Vitest stays green when a story file yields no tests, as long as another file
// runs, so a file that fails discovery would silently stop being tested.
import { spawnSync } from 'node:child_process';
import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RESULTS_FILE = 'node_modules/.vitest-results.json';
const EXCLUDED_FROM_TESTS = /['"]!test['"]/;

const args = process.argv.slice(2);
const { status } = spawnSync(
  'vitest',
  [
    'run',
    '--reporter=default',
    '--reporter=json',
    `--outputFile=${RESULTS_FILE}`,
    ...args,
  ],
  { stdio: 'inherit' }
);

if (status !== 0) {
  process.exit(status ?? 1);
}

// Arguments filter the run, so the other files are skipped on purpose.
if (args.length === 0) {
  const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
  const testCounts = new Map(
    results.testResults.map(({ name, assertionResults }) => [
      name,
      assertionResults.length,
    ])
  );
  const untested = globSync('src/**/*.stories.{ts,tsx}').filter(
    (file) =>
      !testCounts.get(resolve(file)) &&
      !EXCLUDED_FROM_TESTS.test(readFileSync(file, 'utf8'))
  );

  if (untested.length > 0) {
    console.error(`No tests ran for:\n  ${untested.join('\n  ')}`);
    process.exit(1);
  }
}
