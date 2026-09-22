/**
 * SCN-030 — Core Halteverbotszone calculation E2E (corrective FR-008a..e).
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

  await page.getByRole('listitem').filter({ hasText: 'E2E Demo GmbH' }).getByRole('link', { name: 'Produkte' }).click()
  await expect(page.getByRole('heading', { name: 'Produkte' })).toBeVisible()

  await page.getByLabel('Name').fill('Halteverbotszone Berlin')
  await page.getByLabel('Verkaufspreis').fill('89')
  await page.getByLabel('USt %').fill('19')
  await page.getByRole('button', { name: /Halteverbotszone/ }).click()
  await page.getByRole('button', { name: 'Produkt anlegen' }).click()
  await expect(page.getByText('Halteverbotszone Berlin')).toBeVisible()

  await page.getByRole('link', { name: 'Öffnen' }).click()
  await expect(page.getByTestId('kpi-nettoerlös-value')).toBeVisible({ timeout: 15_000 })
}

test.describe('SCN-030 Halteverbotszone core calculation', () => {
  test('desktop: net, departments, inline Fahrer cascade without Inspector', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Inline graph edit is desktop-only')
    test.setTimeout(60_000)

    await createBusinessAndProduct(page)
    await page.screenshot({ path: path.join(EVIDENCE, '01-product-opened.png'), fullPage: true })

    // Per-unit net (SCN-026/030); KPI Nettoerlös is period total and may scale with volume.
    await expect(page.getByText('74.79 EUR / Einh.').first()).toBeVisible()
    await expect(page.getByTestId('kpi-nettoerlös-value')).not.toHaveText(/NaN|Infinity|Unvollständig/)
    await page.screenshot({ path: path.join(EVIDENCE, '02-net-74-79.png'), fullPage: true })

    for (const dept of DEPARTMENTS) {
      await expect(page.getByTestId(`cost-node-${dept}`).first()).toBeVisible()
    }
    await expect(page.getByTestId('cost-node-Fahrer').first()).toBeVisible()
    await page.screenshot({
      path: path.join(EVIDENCE, '03-departments-and-fahrer.png'),
      fullPage: true,
    })

    await expect(page.getByRole('button', { name: 'Inspector (Advanced)' })).toBeVisible()
    // Inspector stays closed — happy path does not require it.
    await expect(page.getByRole('button', { name: 'Inspector schließen' })).toHaveCount(0)

    const contributionBefore = await page.getByTestId('kpi-deckungsbeitrag-value').innerText()
    const directBefore = await page.getByTestId('kpi-direkte-kosten-value').innerText()

    await page.getByLabel('Suche im Graph').fill('Fahrer')
    const fahrer = page.getByTestId('cost-node-Fahrer')
    await expect(fahrer).toBeVisible()
    // React Flow may clip transformed nodes; DOM events still update controlled inputs.
    await fahrer.getByRole('button', { name: '+' }).dispatchEvent('click')
    await expect(fahrer).toHaveAttribute('data-expanded', 'true')
    await expect(fahrer.getByText('Vollkosten / Stunde')).toBeVisible()

    const rateInput = fahrer.locator('input[type="number"]').first()
    await rateInput.evaluate((el: HTMLInputElement) => {
      const proto = window.HTMLInputElement.prototype
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
      descriptor?.set?.call(el, '40')
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await expect
      .poll(async () => page.getByTestId('kpi-direkte-kosten-value').innerText())
      .not.toBe(directBefore)
    await expect
      .poll(async () => page.getByTestId('kpi-deckungsbeitrag-value').innerText())
      .not.toBe(contributionBefore)

    await expect(page.getByRole('button', { name: 'Inspector (Advanced)' })).toBeVisible()
    await page.screenshot({
      path: path.join(EVIDENCE, '04-fahrer-inline-cascade.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: 'Fully Loaded' }).click()
    await expect(page.getByTestId('kpi-alloziierte-kosten-value')).not.toHaveText('ausgeblendet')
    await page.getByRole('button', { name: 'Contribution' }).click()
    await expect(page.getByTestId('kpi-alloziierte-kosten-value')).toHaveText('ausgeblendet')
    await page.screenshot({
      path: path.join(EVIDENCE, '05-contribution-vs-fully-loaded.png'),
      fullPage: true,
    })

    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toMatch(/\bNaN\b/)
    expect(bodyText).not.toMatch(/\bInfinity\b/)
    void browserName
  })

  test('mobile: hierarchy lists departments and Fahrer without requiring canvas', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Hierarchy list is mobile viewport')

    await createBusinessAndProduct(page)
    await expect(page.getByTestId('kpi-nettoerlös-value')).not.toHaveText(/NaN|Infinity|Unvollständig/)
    // Mobile hierarchy uses "/ Stk" labels (canvas is md:hidden).
    await expect(page.getByRole('button', { name: /74\.79 \/ Stk/ }).first()).toBeVisible()

    for (const dept of DEPARTMENTS) {
      await expect(page.getByRole('button', { name: new RegExp(dept) }).first()).toBeVisible()
    }
    await expect(page.getByRole('button', { name: /Fahrer/ }).first()).toBeVisible()
    await page.screenshot({
      path: path.join(EVIDENCE, '06-mobile-hierarchy.png'),
      fullPage: true,
    })

    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toMatch(/\bNaN\b/)
    expect(bodyText).not.toMatch(/\bInfinity\b/)
  })
})
