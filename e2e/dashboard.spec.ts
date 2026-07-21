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

test.describe('Dashboard', () => {
  let testEmail: string

  test.beforeEach(async () => {
    await clearFirestore()
    testEmail = generateTestEmail()
    await createEmulatorUser(testEmail, TEST_PASSWORD)
  })

  test('shows dashboard after login', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('Mercado Inteligente')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Presupuesto diario' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar compra' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Compras de hoy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Historial' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Resumen mensual' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gráficos' })).toBeVisible()
  })

  test('shows user email in header', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await expect(page.getByText(testEmail)).toBeVisible()
  })

  test('displays KPI cards after setting budget', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')

    await expect(page.getByText('Gastado hoy')).toBeVisible()
    await expect(page.getByText('Presupuesto', { exact: true })).toBeVisible()
    await expect(page.getByText('Restante')).toBeVisible()
    await expect(page.getByText('$50,000', { exact: true }).first()).toBeVisible()
  })

  test('shows empty state when no purchases', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('Hoy no compraste nada')).toBeVisible()
    await expect(page.getByText('Registrá una compra para verla acá.')).toBeVisible()
  })

  test('shows progress bar after budget is set', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '100000')

    await expect(page.getByText('0.0% utilizado')).toBeVisible()
  })

  test('updates spent amount after adding purchase', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')

    await addManualPurchase(page, 'Leche', '2', '1500')

    await expect(page.getByText('Leche')).toBeVisible()
    await expect(page.getByText('$3,000', { exact: true }).first()).toBeVisible()
  })

  test('shows over budget indicator when exceeded', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '5000')

    await addManualPurchase(page, 'Carne', '1', '8000')

    await page.getByRole('button', { name: 'Presupuesto diario' }).click()
    await expect(page.getByText('Carne')).toBeVisible()
    await expect(page.getByText('$3,000', { exact: true }).first()).toBeVisible()
  })
})
