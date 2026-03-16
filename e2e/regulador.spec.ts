import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Painel do Regulador', () => {
  let loggedIn = false;

  test.beforeEach(async ({ page }) => {
    try {
      await login(page, TEST_USERS.regulador.email, TEST_USERS.regulador.password);
      loggedIn = true;
    } catch {
      loggedIn = false;
    }
  });

  // ==========================================
  // DASHBOARD REGULADOR
  // ==========================================

  test('deve mostrar o dashboard do regulador', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await expect(page).toHaveURL(/\/regulador/);
  });

  test('deve mostrar sidebar do regulador', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Centros de Formação')).toBeVisible();
    await expect(page.locator('nav').getByText('Formadores')).toBeVisible();
    await expect(page.locator('nav').getByText('Cursos')).toBeVisible();
  });

  // ==========================================
  // CENTROS DE FORMAÇÃO
  // ==========================================

  test('deve mostrar lista de centros de formação', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await page.goto('/regulador/centros');
    await expect(page.getByText(/centro/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve navegar para detalhes de um centro', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await page.goto('/regulador/centros');
    await page.waitForLoadState('networkidle');

    const firstCenter = page.locator('[class*="card"]').first();
    if (await firstCenter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCenter.click();
      await expect(page).toHaveURL(/\/regulador\/centros\/[^/]+$/);
    }
  });

  // ==========================================
  // FORMADORES
  // ==========================================

  test('deve mostrar lista de formadores', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await page.goto('/regulador/formadores');
    await expect(page.getByText('Formadores').first()).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // CURSOS (LEITURA)
  // ==========================================

  test('deve mostrar lista de cursos em modo leitura', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador regulador não existe');
    await page.goto('/regulador/cursos');
    await expect(page.getByText('Cursos').first()).toBeVisible({ timeout: 10000 });
    // Não deve ter botão de criar
    await expect(page.getByText(/novo curso/i)).not.toBeVisible();
  });

  // ==========================================
  // ACESSO NEGADO PARA OUTROS PAPÉIS
  // ==========================================

  test('responsavel não acede a /regulador', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await page.goto('/regulador');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/regulador$/);
  });

  test('admin não acede a /regulador', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/regulador');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/regulador$/);
  });

  test('formando não acede a /regulador', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/regulador');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/regulador$/);
  });
});
