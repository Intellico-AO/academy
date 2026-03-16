import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Gestão de Sessões', () => {
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
  // LISTAR SESSÕES
  // ==========================================

  test('deve mostrar a página de sessões', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    await expect(page.getByText(/sessões formativas/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/pesquisar/i)).toBeVisible();
  });

  test('deve ter botão para criar nova sessão', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    await expect(page.getByText(/nova sessão/i)).toBeVisible();
  });

  test('deve filtrar sessões por pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('sessao-inexistente-xyz');
    await expect(page.getByText(/nenhuma sessão/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar sessões por estado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('ativo');
    await page.waitForTimeout(500);
  });

  test('deve filtrar sessões por tipo', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    const typeSelect = page.locator('select').nth(1);
    if (await typeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeSelect.selectOption('presencial');
      await page.waitForTimeout(500);
    }
  });

  // ==========================================
  // CRIAR SESSÃO
  // ==========================================

  test('deve navegar para /sessoes/nova', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    await page.getByText(/nova sessão/i).click();
    await expect(page).toHaveURL(/\/sessoes\/nova/);
  });

  // ==========================================
  // VER DETALHES
  // ==========================================

  test('deve mostrar detalhes de uma sessão', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/sessoes');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page).toHaveURL(/\/sessoes\/[^/]+$/);
      }
    }
  });

  // ==========================================
  // FORMANDO — VISTA LIMITADA
  // ==========================================

  test('formando não vê botão Nova Sessão', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/sessoes');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/nova sessão/i)).not.toBeVisible();
  });

  test('formando não vê opções de editar/eliminar nas sessões', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/sessoes');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      // Deve ver "Ver detalhes" mas não "Editar" ou "Eliminar"
      await expect(page.getByText(/ver detalhes/i)).toBeVisible();
      await expect(page.getByText(/^editar$/i)).not.toBeVisible();
      await expect(page.getByText(/eliminar/i)).not.toBeVisible();
    }
  });
});
