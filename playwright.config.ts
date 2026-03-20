import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    locale: 'nl-NL',
  },
  reporter: [['list'], ['html', { outputFolder: 'e2e/report', open: 'never' }]],
})
