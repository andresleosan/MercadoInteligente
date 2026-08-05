import { test, expect } from '@playwright/test'
import {
  createEmulatorUser,
  clearFirestore,
  loginWithEmail,
  generateTestEmail,
  setBudget,
  addManualPurchase,
} from './helpers'

const TEST_PASSWORD = 'test123456'

test.describe('Budget Management', () => {
  let testEmail: string

  test.beforeEach(async () => {
    await clearFirestore()
    testEmail = generateTestEmail()
    await createEmulatorUser(testEmail, TEST_PASSWORD)
  })

  test('shows budget section on dashboard', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByRole('button', { name: 'Presupuesto diario' })).toBeVisible()
  })

  test('creates budget and shows confirmation', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '75000')

    await expect(page.getByText('$75,000', { exact: true }).first()).toBeVisible()
  })

  test('shows current budget after creation', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '75000')

    await expect(page.getByText('$75,000', { exact: true }).first()).toBeVisible()
  })

  test('updates existing budget', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')
    await setBudget(page, '80000')

    await expect(page.getByText('$80,000', { exact: true }).first()).toBeVisible()
  })

  test('budget reflects in KPI cards', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '120000')

    await expect(page.getByText('$120,000', { exact: true }).first()).toBeVisible()
  })

  test('shows remaining budget as full when no purchases', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')

    await expect(page.getByText('$0', { exact: true })).toBeVisible()
    await expect(page.getByText('Restante')).toBeVisible()
    await expect(page.getByText('0.0% utilizado')).toBeVisible()
  })

  test('progress bar updates after purchase', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '10000')

    await addManualPurchase(page, 'Leche', '1', '5000')

    await page.getByRole('button', { name: 'Presupuesto diario' }).click()
    await expect(page.getByText('50.0% utilizado')).toBeVisible()
  })
})
