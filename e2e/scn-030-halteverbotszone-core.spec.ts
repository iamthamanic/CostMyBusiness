/**
 * SCN-030 aligned with CSS-grid product calculator workbench.
 * Location: e2e/scn-030-halteverbotszone-core.spec.ts
 */
import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const EVIDENCE = '.qa/evidence/e2e-halteverbotszone-core-calculation'
const DEPARTMENTS = ['Marketing', 'Sales', 'Operations', 'Support', 'Overhead'] as const

test.beforeAll(() => {
  fs.mkdirSync(EVIDENCE, { recursive: true })
})

async function createBusinessAndProduct(page: Page) {
  await page.goto('/businesses')
  await page.getByLabel('Name').fill('E2E Demo GmbH')
  await page.getByRole('button', { name: 'Unternehmen anlegen' }).click()
  await expect(page.getByText('E2E Demo GmbH')).toBeVisible()

  await page
    .getByRole('listitem')
    .filter({ hasText: 'E2E Demo GmbH' })
    .getByRole('link', { name: 'Produkte' })
    .click()
  await expect(page.getByRole('heading', { name: 'Produkte' })).toBeVisible()

  await page.getByLabel('Name').fill('Halteverbotszone Berlin')
  await page.getByLabel('Verkaufspreis').fill('89')
  await page.getByLabel('USt %').fill('19')
  await page.getByRole('button', { name: /Halteverbotszone/ }).click()
  await page.getByRole('button', { name: 'Produkt anlegen' }).click()
  await expect(page.getByText('Halteverbotszone Berlin')).toBeVisible()

  await page.getByRole('link', { name: 'Öffnen' }).click()
  await expect(page.getByTestId('product-root')).toBeVisible({ timeout: 15_000 })
}

test.describe('SCN-030 Halteverbotszone core calculation', () => {
  test('desktop: product root, departments, Fahrer cascade, result spine', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop calculator layout')
    test.setTimeout(90_000)

    await createBusinessAndProduct(page)
    await expect(page.getByTestId('workbench-canvas')).toBeVisible()
    await expect(page.getByTestId('connector-fan-down')).toBeVisible()
    await page.screenshot({ path: path.join(EVIDENCE, '01-product-opened.png'), fullPage: true })

    await expect(page.getByTestId('product-root-price')).toHaveValue('89')
    await expect(page.getByTestId('product-root-vat')).toHaveValue('19')
    await expect(page.getByTestId('product-root-net')).toContainText('74.79')

    for (const tone of ['marketing', 'sales', 'operations', 'support', 'overhead'] as const) {
      await expect(page.getByTestId(`dept-${tone}`)).toBeVisible()
    }
    await expect(page.getByTestId('cost-row-Fahrer')).toBeVisible()
    await expect(page.getByTestId('result-spine')).toBeVisible()
    await page.screenshot({
      path: path.join(EVIDENCE, '02-workbench-layout.png'),
      fullPage: true,
    })

    const contributionBefore = await page.getByTestId('spine-contribution').innerText()
    const directBefore = await page.getByTestId('spine-direct').innerText()
    const profitBefore = await page.getByTestId('spine-profit').innerText()

    const fahrer = page.getByTestId('cost-row-Fahrer')
    await fahrer.getByRole('button').first().click()
    await expect(fahrer).toHaveAttribute('data-expanded', 'true')
    await expect(fahrer.getByText('Vollkosten / Stunde')).toBeVisible()

    const rateInput = fahrer.getByLabel('Fahrer Vollkosten / Stunde')
    await rateInput.fill('40')

    await expect
      .poll(async () => page.getByTestId('spine-direct').innerText())
      .not.toBe(directBefore)
    await expect
      .poll(async () => page.getByTestId('spine-contribution').innerText())
      .not.toBe(contributionBefore)
    await expect
      .poll(async () => page.getByTestId('spine-profit').innerText())
      .not.toBe(profitBefore)

    await page.screenshot({
      path: path.join(EVIDENCE, '03-fahrer-cascade.png'),
      fullPage: true,
    })

    // Price 89 → 99 updates net
    await page.getByTestId('product-root-price').fill('99')
    await expect
      .poll(async () => page.getByTestId('product-root-net').innerText())
      .toMatch(/83\.19/)

    await page.screenshot({
      path: path.join(EVIDENCE, '04-price-99.png'),
      fullPage: true,
    })

    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toMatch(/\bNaN\b/)
    expect(bodyText).not.toMatch(/\bInfinity\b/)
    // Inspector not required — Optionen may exist but Advanced Inspector button from RF is gone by default
    await expect(page.getByRole('button', { name: 'Inspector (Advanced)' })).toHaveCount(0)
    void DEPARTMENTS
  })

  test('mobile: accordion departments and result spine', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile accordion layout')

    await createBusinessAndProduct(page)
    await expect(page.getByTestId('product-root-net')).toContainText('74.79')
    await expect(page.getByTestId('department-accordions')).toBeVisible()
    await expect(page.getByTestId('result-spine')).toBeVisible()
    await page.screenshot({
      path: path.join(EVIDENCE, '05-mobile.png'),
      fullPage: true,
    })

    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toMatch(/\bNaN\b/)
    expect(bodyText).not.toMatch(/\bInfinity\b/)
  })
})
