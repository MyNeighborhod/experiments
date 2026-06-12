import { test, expect } from "@playwright/test"

test.describe("BlockVibe Platform Landing Page E2E Tests", () => {
  test("1. Renders the platform homepage correctly on localhost", async ({ page }) => {
    await page.goto("/")

    // Expect the title to be correct
    await expect(page).toHaveTitle(/BlockVibe - Operating System for Neighborhood Associations/i)

    // Expect main landing page texts to be visible
    await expect(page.locator("text=One platform for your neighborhood")).toBeVisible()
    await expect(page.locator("text=See BlockVibe in Action")).toBeVisible()
    await expect(page.locator("text=Visit Example Site")).toBeVisible()

    // Expect the form elements to be visible
    await expect(page.locator("text=Request a BlockVibe Space")).toBeVisible()
    await expect(page.locator("label:has-text('Neighborhood / Tenant Name')")).toBeVisible()
    await expect(page.locator("label:has-text('Contact Email')")).toBeVisible()
    await expect(page.locator("label:has-text('Phone Number')")).toBeVisible()
    await expect(page.locator("label:has-text('Full Mailing Address')")).toBeVisible()
    await expect(page.locator("label:has-text('Security Verification')")).toBeVisible()
  })

  test("2. Displays correct NOG example link dynamically", async ({ page }) => {
    await page.goto("/")

    const exampleLink = page.locator("a:has-text('Visit Example Site')")
    await expect(exampleLink).toBeVisible()

    const href = await exampleLink.getAttribute("href")
    expect(href).toContain("nog.localhost")
  })

  test("3. Captcha challenge generates and security answer rejects wrong inputs", async ({ page }) => {
    await page.goto("/")

    // Wait for the captcha text to load
    const solveText = page.locator("text=Solve:")
    await expect(solveText).toBeVisible()

    // Fill the form fields
    await page.fill("input[name='tenantName']", "Test E2E Neighborhood")
    await page.fill("input[name='email']", "e2etest@example.com")
    await page.fill("input[name='phone']", "555-123-4567")
    await page.fill("input[name='address']", "123 Main St, Anytown, IA")
    await page.fill("input[name='captchaAnswer']", "999") // deliberately wrong answer

    // Submit
    await page.click("button[type='submit']")

    // Expect error message
    await expect(page.locator("text=Incorrect or expired captcha answer")).toBeVisible()
  })

  test("4. Standard NOG website homepage loads on nog subdomain", async ({ browser, baseURL }) => {
    const url = new URL(baseURL || "http://localhost:3000")
    url.hostname = "nog.localhost"

    const context = await browser.newContext({ baseURL: url.toString() })
    const page = await context.newPage()

    await page.goto("/")

    // The NOG homepage should not render BlockVibe's custom landing page
    await expect(page.locator("text=One platform for your neighborhood")).toBeHidden()

    // Instead it should render NOG title/header
    await expect(page.locator("text=North Of Grand").first()).toBeVisible()

    await context.close()
  })
})
