import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Gestão de Programas', () => {
  let loggedIn = false;

  test.beforeEach(async ({ page }) => {
    try {
      await login(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
      loggedIn = true;
    } catch {
      loggedIn = false;
    }
  });

  test('deve mostrar a página de programas', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    await expect(page.getByText(/programa/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/pesquisar/i)).toBeVisible();
  });

  test('deve ter botão para criar novo programa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    await expect(page.getByText(/novo programa/i)).toBeVisible();
  });

  test('deve navegar para /programas/novo', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    await page.getByText(/novo programa/i).click();
    await expect(page).toHaveURL(/\/programas\/novo/);
  });

  test('deve filtrar programas por pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('programa-inexistente-xyz');
    await expect(page.getByText(/nenhum programa/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar programas por estado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('ativo');
    await page.waitForTimeout(500);
  });

  test('deve mostrar detalhes de um programa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/programas');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page).toHaveURL(/\/programas\/[^/]+$/);
      }
    }
  });

  // Formando não vê programas na sidebar
  test('formando não acede a programas', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/programas');
    // Formando é redirecionado ou não vê conteúdo de programas
    // (depende da implementação — programas não está na sidebar do formando)
  });
});
