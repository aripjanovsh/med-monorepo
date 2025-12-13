import { test, expect } from '@playwright/test';

// Test credentials
const TEST_PHONE = '+998901234567';
const TEST_PASSWORD = 'AdminPass123!';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    // Check page title and main heading
    await expect(page.getByRole('heading', { name: 'Добро пожаловать' })).toBeVisible();
    await expect(page.getByText('Войдите в свой аккаунт')).toBeVisible();

    // Check form fields are visible
    await expect(page.getByLabel('Номер телефона')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();

    // Check additional links
    await expect(page.getByText('Забыли пароль?')).toBeVisible();
    await expect(page.getByText('Нет аккаунта?')).toBeVisible();
  });

  test('should show validation error for empty phone', async ({ page }) => {
    await page.getByRole('button', { name: 'Войти' }).click();

    // Wait for phone validation error to appear
    await expect(page.locator('text=/phone.*required/i')).toBeVisible({ timeout: 2000 });
  });

  test('should show error for invalid phone format', async ({ page }) => {
    // Enter invalid phone number
    await page.getByLabel('Номер телефона').fill('123');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();

    // Should show invalid credentials error (backend validation)
    await expect(page.locator('text=/invalid credentials/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter valid format but wrong credentials
    await page.getByLabel('Номер телефона').fill(TEST_PHONE);
    await page.getByLabel('Пароль').fill('wrongpassword');
    await page.getByRole('button', { name: 'Войти' }).click();

    // Wait for error message
    await expect(page.locator('text=/ошибка входа|неверн|invalid/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.getByLabel('Номер телефона').fill(TEST_PHONE);
    await page.getByLabel('Пароль').fill(TEST_PASSWORD);

    // Click login button
    await page.getByRole('button', { name: 'Войти' }).click();

    // Wait for navigation to cabinet page
    await page.waitForURL('/cabinet', { timeout: 10000 });

    // Verify we're on the cabinet page
    await expect(page).toHaveURL('/cabinet');
  });

  test('should redirect to cabinet after successful login', async ({ page }) => {
    await page.getByLabel('Номер телефона').fill(TEST_PHONE);
    await page.getByLabel('Пароль').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Войти' }).click();

    // Should redirect to cabinet
    await expect(page).toHaveURL('/cabinet', { timeout: 10000 });
  });

  test('should show loading state during login', async ({ page }) => {
    await page.getByLabel('Номер телефона').fill(TEST_PHONE);
    await page.getByLabel('Пароль').fill(TEST_PASSWORD);

    // Click login
    await page.getByRole('button', { name: 'Войти' }).click();

    // Should show loading text
    await expect(page.getByRole('button', { name: 'Вход...' })).toBeVisible({ timeout: 1000 });
  });

  test('should persist session after page reload', async ({ page }) => {

    await page.getByLabel('Номер телефона').fill(TEST_PHONE);
    await page.getByLabel('Пароль').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Войти' }).click();

    await page.waitForURL('/cabinet', { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on cabinet page (session persisted)
    await expect(page).toHaveURL('/cabinet');
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByText('Забыли пароль?');
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  test('should have registration link', async ({ page }) => {
    await expect(page.getByText('Нет аккаунта?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Зарегистрироваться' })).toBeVisible();
  });

  test('should display terms and privacy policy links', async ({ page }) => {
    await expect(page.getByText('Условиями использования')).toBeVisible();
    await expect(page.getByText('Политикой конфиденциальности')).toBeVisible();
  });
});
