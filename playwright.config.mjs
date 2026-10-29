import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7000 },
  outputDir: resolve(process.env.TEST_ARTIFACT_DIR ?? 'node_modules/.cache/littlelist/browser', 'results'),
  reporter: [
    ['list'],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_FILE ?? resolve(process.env.TEST_ARTIFACT_DIR ?? 'node_modules/.cache/littlelist/browser', 'results.json') }],
    ['html', { outputFolder: resolve(process.env.TEST_ARTIFACT_DIR ?? 'node_modules/.cache/littlelist/browser', 'report'), open:'never' }],
  ],
  use: {
    browserName: 'chromium',
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel:process.env.PLAYWRIGHT_CHANNEL } : {}),
    trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure',
    colorScheme: 'light', locale:'en-US', reducedMotion:'reduce',
  },
  projects: [
    { name:'desktop', use:{ viewport:{ width:1440,height:1000 } } },
    { name:'mobile', use:{ viewport:{ width:390,height:844 }, isMobile:true, hasTouch:true } },
  ],
});
