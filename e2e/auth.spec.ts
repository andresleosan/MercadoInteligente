import { test, expect } from '@playwright/test'
import {
  createEmulatorUser,
  clearFirestore,
  loginWithEmail,
  registerUser,
  generateTestEmail,
} from './helpers'

const TEST_PASSWORD = 'test123456'

test.describe('Auth Flows', () => {
  test.beforeEach(async () => {
    await clearFirestore()
  })

  test('shows login page with correct elements', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Mercado Inteligente')).toBeVisible()
    await expect(page.getByText('Iniciá sesión para continuar')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible()
    await expect(page.getByText('¿No tenés cuenta?')).toBeVisible()
  })

  test('shows register page with correct elements', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Crear cuenta')).toBeVisible()
    await expect(page.getByText('Empezá a controlar tu presupuesto')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
    await expect(page.getByText('¿Ya tenés cuenta?')).toBeVisible()
  })

  test('navigates from login to register', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByText('Registrate').click()
    await expect(page).toHaveURL('/register')
  })

  test('navigates from register to login', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.getByText('Iniciá sesión').click()
    await expect(page).toHaveURL('/login')
  })

  test('register with mismatched passwords shows error', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const email = generateTestEmail()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña').fill('password123')
    await page.getByLabel('Confirmar contraseña').fill('different123')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible()
  })

  test('register with short password shows error', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const email = generateTestEmail()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña').fill('12345')
    await page.getByLabel('Confirmar contraseña').fill('12345')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible()
  })

  test('register with valid data redirects to dashboard', async ({ page }) => {
    const email = generateTestEmail()
    await registerUser(page, email, TEST_PASSWORD)
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Mercado Inteligente')).toBeVisible()
  })

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)

    await loginWithEmail(page, email, TEST_PASSWORD)
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Mercado Inteligente')).toBeVisible()
  })

  test('login with wrong password shows error', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña').fill('wrongpassword')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible()
  })

  test('protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/login')
  })

  test('logout returns to login page', async ({ page }) => {
    const email = generateTestEmail()
    await createEmulatorUser(email, TEST_PASSWORD)
    await loginWithEmail(page, email, TEST_PASSWORD)

    await page.getByText('Salir').click()
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })
})
