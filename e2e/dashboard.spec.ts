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
    await expect(page.getByText('Presupuesto')).toBeVisible()
    await expect(page.getByText('Resumen del mes')).toBeVisible()
    await expect(page.getByText('Historial de compras')).toBeVisible()
    await expect(page.getByText('Registrar compra')).toBeVisible()
    await expect(page.getByText('Gráficos')).toBeVisible()
  })

  test('shows user email in header', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await expect(page.getByText(testEmail)).toBeVisible()
  })

  test('displays KPI cards after setting budget', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')

    await expect(page.getByText('Gastado')).toBeVisible()
    await expect(page.getByText('Presupuesto')).toBeVisible()
    await expect(page.getByText('Restante')).toBeVisible()
    await expect(page.getByText('$50.000')).toBeVisible()
  })

  test('shows empty state when no purchases', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('Sin compras')).toBeVisible()
    await expect(page.getByText('No hay compras registradas en este mes.')).toBeVisible()
  })

  test('shows progress bar after budget is set', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '100000')

    await expect(page.getByText('0.0% del presupuesto utilizado')).toBeVisible()
  })

  test('updates spent amount after adding purchase', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '50000')

    await addManualPurchase(page, 'Leche', '2', '1500')

    await expect(page.getByText('$3.000')).toBeVisible()
  })

  test('shows over budget indicator when exceeded', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '5000')

    await addManualPurchase(page, 'Carne', '1', '8000')

    await expect(page.getByText('Pasado')).toBeVisible()
  })
})
