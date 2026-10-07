import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/e2e', workers: 2,
  use: { headless: true, actionTimeout: 10000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
});
