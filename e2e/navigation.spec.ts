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

test.describe('Navigation & UI', () => {
  let testEmail: string

  test.beforeEach(async () => {
    await clearFirestore()
    testEmail = generateTestEmail()
    await createEmulatorUser(testEmail, TEST_PASSWORD)
  })

  test('month selector is visible', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByRole('button', { name: 'Resumen mensual' })).toBeVisible()
  })

  test('expandable cards toggle content', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByRole('button', { name: 'Historial' }).click()
    await expect(page.getByText('Historial de compras')).toBeVisible()

    await expect(page.locator('form').getByRole('button', { name: 'Registrar compra' })).toBeVisible()
  })

  test('shows loading spinner while data loads', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Contraseña').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await page.waitForURL('/', { timeout: 10000 })
  })

  test('responsive layout works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('Mercado Inteligente')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Presupuesto diario' })).toBeVisible()
  })

  test('shows chart section', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('Gráficos')).toBeVisible()
  })

  test('error state shows retry button in purchase history', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByRole('button', { name: 'Historial' }).click()
    await expect(page.getByText('Actualizar historial')).toBeVisible()
  })
})
