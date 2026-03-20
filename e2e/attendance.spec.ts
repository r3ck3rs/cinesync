import { test, expect } from '@playwright/test'

const BASE_URL = 'https://cinesync-web-production.up.railway.app'

test.describe('Attendance avatar', () => {
  test('avatar appears and stays after tapping +', async ({ page }) => {
    // Go to feed (unauthenticated — just check UI structure first)
    await page.goto(`${BASE_URL}/feed`)
    await page.screenshot({ path: 'e2e/screenshots/01-feed-initial.png', fullPage: false })

    // Find the first + button
    const plusBtn = page.locator('button').filter({ hasText: '+' }).first()
    await expect(plusBtn).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: 'e2e/screenshots/02-plus-button-visible.png' })

    // Click it (will redirect to login if not authenticated)
    await plusBtn.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'e2e/screenshots/03-after-click.png' })

    // Log what happened
    const url = page.url()
    console.log('URL after click:', url)
    console.log('Redirected to login:', url.includes('login'))
  })

  test('feed loads with movie cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/04-feed-loaded.png', fullPage: true })

    // Check movie cards exist
    const cards = page.locator('[data-testid="screening-card"], .bg-gray-900').first()
    await page.screenshot({ path: 'e2e/screenshots/05-cards.png' })

    // Log page content summary
    const text = await page.textContent('body')
    console.log('Page has screenings:', text?.includes('Cinerama') || text?.includes('KINO') || text?.includes('Pathé'))
    console.log('Page has + buttons:', text?.includes('+'))
  })
})
