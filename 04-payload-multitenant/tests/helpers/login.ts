import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

export interface LoginOptions {
  page: Page
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({ page, user }: LoginOptions): Promise<void> {
  await page.goto("/admin/login")
  await page.waitForLoadState("networkidle")

  const inputs = page.locator("form input:visible")
  await inputs.first().waitFor({ state: "visible" })
  await inputs.nth(0).fill(user.email)
  await inputs.nth(1).fill(user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL("**/admin")

  const dashboardArtifact = page.locator('span[title="Dashboard"]')
  await expect(dashboardArtifact).toBeVisible()
}
