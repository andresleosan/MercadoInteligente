import { type Page, expect } from '@playwright/test'

const FIREBASE_API_KEY = 'test-api-key'
const AUTH_EMULATOR = 'http://localhost:9099'
const PROJECT_ID = 'demo-mercado-inteligente'

export async function createEmulatorUser(email: string, password: string): Promise<string> {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  )
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || 'No se pudo crear el usuario en el emulador')
  }
  return data.localId
}

export async function deleteEmulatorUser(uid: string): Promise<void> {
  await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: uid }),
    }
  )
}

export async function clearFirestore(): Promise<void> {
  await fetch(
    `http://localhost:8085/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  )
}

export async function loginWithEmail(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await page.waitForURL('/', { timeout: 10000 })
}

export async function registerUser(page: Page, email: string, password: string) {
  await page.goto('/register')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Email').fill(email)
  await page.getByPlaceholder('Contraseña (mín. 6 caracteres)').fill(password)
  await page.getByLabel('Confirmar contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  await page.waitForURL('/', { timeout: 10000 })
}

export async function expectDashboardLoaded(page: Page) {
  await expect(page.getByText('Mercado Inteligente')).toBeVisible()
  await expect(page.getByText('Presupuesto diario')).toBeVisible()
}

export async function setBudget(page: Page, amount: string) {
  await page.getByRole('button', { name: 'Presupuesto diario' }).click()
  const budgetInput = page.getByLabel('Monto diario')
  await expect(budgetInput).toBeVisible()
  await budgetInput.fill(amount)
  const saveButton = budgetInput.locator('xpath=ancestor::div[contains(@class,"flex-1")]/following-sibling::button[normalize-space()="Guardar"]')
  await saveButton.click()
  await expect(page.getByText('Presupuesto guardado')).toBeVisible()
}

export async function addManualPurchase(
  page: Page,
  productName: string,
  quantity: string,
  unitPrice: string
) {
  await page.getByLabel('Producto').fill(productName)
  await page.getByLabel('Cantidad').fill(quantity)
  await page.getByLabel('Precio unitario').fill(unitPrice)
  await page.locator('form').getByRole('button', { name: 'Registrar compra' }).click()
}

export function generateTestEmail(): string {
  const timestamp = Date.now()
  return `test-${timestamp}@example.com`
}
