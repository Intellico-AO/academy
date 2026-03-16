import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS, logout } from './fixtures/auth';

test.describe('Autenticação', () => {
  // ==========================================
  // PÁGINA DE LOGIN
  // ==========================================

  test('deve mostrar a página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'FormaPro' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  });

  test('deve mostrar erro com email inválido', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('email-invalido');
    await page.getByRole('button', { name: 'Continuar' }).click();
    // Campo html5 email validation impede submissão
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve mostrar erro com email não registado', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('naoexiste@teste.com');
    await page.getByRole('button', { name: 'Continuar' }).click();
    // Erro inline no formulário (não o toast)
    await expect(page.locator('form .bg-rose-50').or(page.getByRole('alert').first())).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar erro com password incorreta', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(TEST_USERS.admin.email);
    await page.getByRole('button', { name: 'Continuar' }).click();

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ timeout: 10000 });
    await passwordInput.fill('PasswordErrada123');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Erro inline ou toast de erro
    await expect(page.locator('form .bg-rose-50').or(page.getByRole('alert').first())).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // LOGIN POR PAPEL
  // ==========================================

  test('login como admin → redireciona para /admin', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('login como responsável → redireciona para dashboard', async ({ page }) => {
    test.skip(!(await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password)), 'Utilizador responsável não existe no Firebase');
    await expect(page).toHaveURL('/');
  });

  test('login como formador → redireciona para dashboard', async ({ page }) => {
    test.skip(!(await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password)), 'Utilizador formador não existe no Firebase');
    await expect(page).toHaveURL('/');
  });

  test('login como formando → redireciona para dashboard', async ({ page }) => {
    test.skip(!(await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password)), 'Utilizador formando não existe no Firebase');
    await expect(page).toHaveURL('/');
  });

  test('login como regulador → redireciona para /regulador', async ({ page }) => {
    test.skip(!(await canLogin(page, TEST_USERS.regulador.email, TEST_USERS.regulador.password)), 'Utilizador regulador não existe no Firebase');
    await expect(page).toHaveURL(/\/regulador/);
  });

  // ==========================================
  // LOGOUT
  // ==========================================

  test('logout redireciona para /login', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });

  // ==========================================
  // PÁGINAS PÚBLICAS
  // ==========================================

  test('deve mostrar a página de registo', async ({ page }) => {
    await page.goto('/registar');
    await expect(page.getByRole('heading', { name: /dados do centro/i })).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar a página de recuperar password', async ({ page }) => {
    await page.goto('/recuperar-password');
    await expect(page.getByRole('heading', { name: /esqueceu/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  // ==========================================
  // PROTEÇÃO DE ROTAS
  // ==========================================

  test('utilizador não autenticado é redirecionado para /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('utilizador não autenticado não acede a /cursos', async ({ page }) => {
    await page.goto('/cursos');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('utilizador não autenticado não acede a /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('utilizador não autenticado não acede a /regulador', async ({ page }) => {
    await page.goto('/regulador');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
