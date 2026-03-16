import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Painel de Administração', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
  });

  // ==========================================
  // DASHBOARD ADMIN
  // ==========================================

  test('deve mostrar o dashboard admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/administração/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar sidebar admin', async ({ page }) => {
    await expect(page.getByText(/administração/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/reguladores/i)).toBeVisible();
  });

  // ==========================================
  // REGULADORES
  // ==========================================

  test('deve mostrar a página de reguladores', async ({ page }) => {
    await page.goto('/admin/reguladores');
    await expect(page.getByText(/regulador/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve ter botão para criar novo regulador', async ({ page }) => {
    await page.goto('/admin/reguladores');
    await expect(page.getByText(/novo regulador/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve navegar para /admin/reguladores/novo', async ({ page }) => {
    await page.goto('/admin/reguladores');
    await page.getByText(/novo regulador/i).click();
    await expect(page).toHaveURL(/\/admin\/reguladores\/novo/);
  });

  test('deve mostrar formulário de criação de regulador', async ({ page }) => {
    await page.goto('/admin/reguladores/novo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/nome/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // ADMINISTRADORES
  // ==========================================

  test('deve mostrar a página de administradores', async ({ page }) => {
    await page.goto('/admin/administradores');
    await expect(page.getByText(/administrador/i)).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // ACESSO NEGADO PARA OUTROS PAPÉIS
  // ==========================================

  test('responsavel não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test('formador não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test('regulador não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.regulador.email, TEST_USERS.regulador.password);
    test.skip(!ok, 'Utilizador regulador não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test('formando não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/admin$/);
  });
});
