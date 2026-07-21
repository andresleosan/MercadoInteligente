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

test.describe('Purchase Flow', () => {
  let testEmail: string

  test.beforeEach(async () => {
    await clearFirestore()
    testEmail = generateTestEmail()
    await createEmulatorUser(testEmail, TEST_PASSWORD)
  })

  test('manual purchase form has all fields', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByLabel('Producto')).toBeVisible()
    await expect(page.getByLabel('Cantidad')).toBeVisible()
    await expect(page.getByLabel('Precio unitario')).toBeVisible()
    await expect(page.locator('form').getByRole('button', { name: 'Registrar compra' })).toBeVisible()
    await expect(page.getByText(/Total: \$0/)).toBeVisible()
  })

  test('shows photo and voice buttons', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await expect(page.getByText('📷 Registrar por foto')).toBeVisible()
    await expect(page.getByText('🎤 Registrar por voz')).toBeVisible()
  })

  test('calculates total dynamically', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByLabel('Producto').fill('Leche')
    await page.getByLabel('Cantidad').fill('2')
    await page.getByLabel('Precio unitario').fill('1500')

    await expect(page.getByText(/Total: \$3[.,]000/)).toBeVisible()
  })

  test('can add multiple products', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByLabel('Producto').fill('Leche')
    await page.getByLabel('Cantidad').fill('1')
    await page.getByLabel('Precio unitario').fill('1500')

    await expect(page.getByRole('button', { name: '+ Agregar producto' })).toBeVisible()
    await expect(page.getByText(/Total: \$1[.,]500/)).toBeVisible()
  })

  test('can remove a product', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByLabel('Producto').fill('Leche')
    await page.getByLabel('Cantidad').fill('1')
    await page.getByLabel('Precio unitario').fill('1500')

    await page.getByRole('button', { name: '+ Agregar producto' }).click()

    const productInputs = page.getByLabel('Producto')
    await expect(productInputs).toHaveCount(2)

    await page.getByRole('button', { name: '×' }).first().click()

    await expect(page.getByLabel('Producto')).toHaveCount(1)
  })

  test('cannot remove last product', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    const removeButton = page.getByRole('button', { name: '×' })
    await expect(removeButton).toBeDisabled()
  })

  test('shows error when submitting empty form', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)

    await page.getByLabel('Producto').fill('Pan')
    await page.getByLabel('Cantidad').fill('0')
    await page.getByLabel('Precio unitario').fill('0')

    await page.locator('form').evaluate((form) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    await expect(page.getByText('Agregá al menos un producto válido')).toBeVisible()
  })

  test('registers purchase and shows in history', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '100000')

    await addManualPurchase(page, 'Gaseosa', '3', '1200')

    await expect(page.getByText('Gaseosa')).toBeVisible()
    await expect(page.getByText('$3,600').first()).toBeVisible()
  })

  test('registers multiple purchases and accumulates total', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '100000')

    await addManualPurchase(page, 'Leche', '2', '1500')
    await addManualPurchase(page, 'Pan', '4', '500')

    await expect(page.getByText('$3,000').first()).toBeVisible()
    await expect(page.getByRole('button', { name: '+ Agregar producto' })).toBeVisible()
  })

  test('can delete a purchase from history', async ({ page }) => {
    await loginWithEmail(page, testEmail, TEST_PASSWORD)
    await setBudget(page, '100000')

    await addManualPurchase(page, 'Leche', '1', '1500')

    page.on('dialog', (dialog) => dialog.accept())
    await page.locator('button:not([disabled])', { hasText: '×' }).last().click()

    await expect(page.getByText('Hoy no compraste nada')).toBeVisible()
  })
})
