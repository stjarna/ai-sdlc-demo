import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
const evidence = process.env.SDLC_QA_EVIDENCE;
if (!evidence) throw new Error('Use the reviewed qa/run-check.mjs ui runner to preserve fresh evidence.');
export default defineConfig({
  testDir: './browser', workers: 1, fullyParallel: false, retries: 0, forbidOnly: true,
  timeout: 20_000, expect: { timeout: 5000 },
  outputDir: join(evidence, 'results'),
  reporter: [['list'], ['json', { outputFile: join(evidence, 'results.json') }], ['html', { outputFolder: join(evidence, 'report'), open: 'never' }]],
  use: { browserName: 'chromium', locale: 'en-US', colorScheme: 'light', reducedMotion: 'reduce',
    trace: 'on', screenshot: 'on', video: 'on' },
  projects: [
    { name: 'desktop-los-angeles', use: { viewport: { width: 1440, height: 1000 }, timezoneId: 'America/Los_Angeles' } },
    { name: 'mobile-kiritimati', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'Pacific/Kiritimati' } },
  ],
});
