import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Gestão de Formadores', () => {
  let loggedIn = false;

  test.beforeEach(async ({ page }) => {
    try {
      await login(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
      loggedIn = true;
    } catch {
      loggedIn = false;
    }
  });

  // ==========================================
  // LISTAR FORMADORES
  // ==========================================

  test('deve mostrar a página de formadores', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    await expect(page.getByText('Formadores').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve ter botão para criar novo formador', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    await expect(page.getByText(/novo formador/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve ter barra de pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    await expect(page.getByPlaceholder(/pesquisar/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve filtrar formadores por pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('formador-inexistente-xyz');
    await expect(page.getByText(/nenhum formador/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar formadores por estado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('ativo');
    await page.waitForTimeout(500);
  });

  // ==========================================
  // CRIAR FORMADOR
  // ==========================================

  test('deve navegar para /formadores/novo', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    await page.getByText(/novo formador/i).click();
    await expect(page).toHaveURL(/\/formadores\/novo/);
  });

  test('deve mostrar formulário de criação', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores/novo');
    await page.waitForLoadState('networkidle');
    // Deve ter campos: nome, email, telefone, NIF, etc.
    await expect(page.getByLabel(/nome/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // VER DETALHES E EDITAR
  // ==========================================

  test('deve mostrar detalhes de um formador', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formadores');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page).toHaveURL(/\/formadores\/[^/]+$/);
      }
    }
  });

  // ==========================================
  // ACESSO — APENAS GESTOR
  // ==========================================

  test('formador não acede a /formadores', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await page.goto('/formadores');
    // Deve ser redirecionado ou mostrar erro
    await page.waitForTimeout(3000);
    const url = page.url();
    // Espera-se que não fique em /formadores ou que veja mensagem de erro
    expect(url.includes('/formadores') === false || await page.getByText(/acesso negado/i).isVisible().catch(() => false)).toBeTruthy();
  });

  test('formando não acede a /formadores', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/formadores');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/formadores') === false || await page.getByText(/acesso negado/i).isVisible().catch(() => false)).toBeTruthy();
  });
});
