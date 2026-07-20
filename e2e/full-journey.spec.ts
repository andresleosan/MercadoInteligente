import { test, expect } from '@playwright/test'
import {
  createEmulatorUser,
  clearFirestore,
  loginWithEmail,
  registerUser,
  generateTestEmail,
  setBudget,
  addManualPurchase,
} from './helpers'

const TEST_PASSWORD = 'test123456'

test.describe('Full User Journey', () => {
  test.beforeEach(async () => {
    await clearFirestore()
  })

  test('complete flow: register → set budget → add purchases → verify dashboard', async ({ page }) => {
    const email = generateTestEmail()

    // Step 1: Register
    await registerUser(page, email, TEST_PASSWORD)
    await expect(page).toHaveURL('/')

    // Step 2: Set budget
    await setBudget(page, '100000')
    await expect(page.getByText('Presupuesto guardado correctamente')).toBeVisible()

    // Step 3: Add purchases
    await addManualPurchase(page, 'Leche', '2', '1500')
    await addManualPurchase(page, 'Pan', '4', '500')
    await addManualPurchase(page, 'Carne', '1', '8000')

    // Step 4: Verify dashboard shows correct totals
    await expect(page.getByText('$13.000')).toBeVisible()
    await expect(page.getByText('$87.000')).toBeVisible()

    // Step 5: Verify purchases in history
    await expect(page.getByText('Leche')).toBeVisible()
    await expect(page.getByText('Pan')).toBeVisible()
    await expect(page.getByText('Carne')).toBeVisible()
  })

  test('complete flow: login → set budget → add purchase → delete → verify empty', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)

    // Step 1: Login
    await loginWithEmail(page, email, TEST_PASSWORD)
    await expect(page).toHaveURL('/')

    // Step 2: Set budget
    await setBudget(page, '50000')

    // Step 3: Add purchase
    await addManualPurchase(page, 'Gaseosa', '2', '1200')
    await expect(page.getByText('$2.400')).toBeVisible()

    // Step 4: Delete purchase
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Eliminar' }).first().click()

    // Step 5: Verify empty state
    await expect(page.getByText('Sin compras')).toBeVisible()
  })

  test('complete flow: budget over-spending shows warning', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)

    await loginWithEmail(page, email, TEST_PASSWORD)
    await setBudget(page, '10000')

    await addManualPurchase(page, 'Electronics', '1', '15000')

    await expect(page.getByText('Pasado')).toBeVisible()
    await expect(page.getByText('$5.000')).toBeVisible()
  })

  test('logout and re-login preserves data', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)

    await loginWithEmail(page, email, TEST_PASSWORD)
    await setBudget(page, '60000')
    await addManualPurchase(page, 'Café', '1', '2500')

    // Logout
    await page.getByText('Salir').click()
    await page.waitForURL('/login', { timeout: 5000 })

    // Re-login
    await loginWithEmail(page, email, TEST_PASSWORD)

    // Data should persist
    await expect(page.getByText('$2.500')).toBeVisible()
    await expect(page.getByText('$57.500')).toBeVisible()
  })
})
