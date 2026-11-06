// Vitest stays green when a story file yields no tests, as long as another file
// runs, so a file that fails discovery would silently stop being tested.
import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const results = JSON.parse(
  readFileSync('node_modules/.vitest-results.json', 'utf8')
);
const testCounts = new Map(
  results.testResults.map(({ name, assertionResults }) => [
    name,
    assertionResults.length,
  ])
);
const untested = globSync('src/**/*.stories.{ts,tsx}').filter(
  (file) => !testCounts.get(resolve(file))
);

if (untested.length > 0) {
  console.error(`No tests ran for:\n  ${untested.join('\n  ')}`);
  process.exit(1);
}
