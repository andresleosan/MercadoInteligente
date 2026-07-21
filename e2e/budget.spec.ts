import { test, expect } from '@playwright/test'
import {
  createEmulatorUser,
  clearFirestore,
  loginWithEmail,
  generateTestEmail,
  setBudget,
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

    await page.getByLabel('Producto').fill('Leche')
    await page.getByLabel('Cantidad').fill('1')
    await page.getByLabel('Precio unitario').fill('5000')
    await page.locator('form').getByRole('button', { name: 'Registrar compra' }).click()

    await expect(page.getByText('50.0% utilizado')).toBeVisible()
  })
})
