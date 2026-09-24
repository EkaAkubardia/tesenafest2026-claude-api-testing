import { defineConfig, type ReporterDescription } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;

const reporter: ReporterDescription[] = [['list'], ['html', { open: 'never' }]];
if (isCI) reporter.push(['github']);

export default defineConfig({
  testDir: './tests',
  // All runs share one Todoist account, so tests run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  // A test that passes only on retry is reported as flaky.
  retries: isCI ? 1 : 0,
  timeout: 30_000,
  reporter,
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
  },
});
