import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Controlo de Acesso por Papel', () => {
  // ==========================================
  // ADMIN
  // ==========================================

  test('admin é redirecionado de / para /admin', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/');
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });

  test('admin acede a /admin/reguladores', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/admin/reguladores');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/admin\/reguladores/);
  });

  // ==========================================
  // REGULADOR
  // ==========================================

  test('regulador é redirecionado de / para /regulador', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.regulador.email, TEST_USERS.regulador.password);
    test.skip(!ok, 'Utilizador regulador não existe');
    await page.goto('/');
    await expect(page).toHaveURL(/\/regulador/, { timeout: 10000 });
  });

  test('regulador não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.regulador.email, TEST_USERS.regulador.password);
    test.skip(!ok, 'Utilizador regulador não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    expect(page.url()).not.toMatch(/\/admin$/);
  });

  // ==========================================
  // GESTOR
  // ==========================================

  test('responsavel acede ao dashboard', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Painel de Controlo')).toBeVisible({ timeout: 10000 });
  });

  test('responsavel acede a /cursos', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await expect(page.getByText('Cursos')).toBeVisible({ timeout: 10000 });
  });

  test('responsavel acede a /formandos', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await expect(page.getByRole('heading', { name: /formandos/i })).toBeVisible({ timeout: 10000 });
  });

  test('responsavel não acede a /admin', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    test.skip(!ok, 'Utilizador responsavel não existe');
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    expect(page.url()).not.toMatch(/\/admin$/);
  });

  // ==========================================
  // FORMADOR
  // ==========================================

  test('formador acede ao dashboard', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await expect(page.getByText('Painel de Controlo')).toBeVisible({ timeout: 10000 });
  });

  test('formador não vê Formadores na sidebar', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await expect(page.locator('nav').getByText('Formadores')).not.toBeVisible();
  });

  test('formador não vê Formandos na sidebar', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await expect(page.locator('nav').getByText('Formandos')).not.toBeVisible();
  });

  test('formador não vê Auditoria na sidebar', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await expect(page.locator('nav').getByText('Auditoria')).not.toBeVisible();
  });

  // ==========================================
  // FORMANDO
  // ==========================================

  test('formando acede ao dashboard com vista adaptada', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await expect(page.getByText('As Minhas Formações')).toBeVisible({ timeout: 10000 });
  });

  test('formando não vê botão Novo Curso', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/cursos');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: /novo curso/i })).not.toBeVisible();
  });

  test('formando não vê Programas na sidebar', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await expect(page.locator('nav').getByText('Programas')).not.toBeVisible();
  });

  test('formando não vê Formandos na sidebar', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await expect(page.locator('nav').getByText('Formandos')).not.toBeVisible();
  });
});
