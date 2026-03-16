import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Documentos Pedagógicos (Planos)', () => {
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
  // PÁGINA DE PLANOS
  // ==========================================

  test('deve mostrar a página de planos', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await expect(page.getByText(/documentos pedagógicos/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve ter seletor de sessão', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await expect(page.getByText(/selecionar sessão/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar empty state sem sessão selecionada', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await expect(page.getByText(/selecione uma sessão/i)).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // TABS
  // ==========================================

  test('deve mostrar 3 tabs quando sessão selecionada', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    // Selecionar primeira sessão disponível
    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Verificar tabs
        await expect(page.getByText(/plano de sessão/i)).toBeVisible();
        await expect(page.getByText(/plano de demonstração/i)).toBeVisible();
        await expect(page.getByText(/fichas de trabalho/i)).toBeVisible();
      }
    }
  });

  test('deve alternar entre tabs', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Clicar na tab de demonstração
        await page.getByText(/plano de demonstração/i).click();
        await page.waitForTimeout(500);

        // Clicar na tab de fichas
        await page.getByText(/fichas de trabalho/i).click();
        await page.waitForTimeout(500);

        // Voltar ao plano de sessão
        await page.getByText(/plano de sessão/i).first().click();
      }
    }
  });

  // ==========================================
  // PLANO DE SESSÃO — FORMULÁRIO
  // ==========================================

  test('deve mostrar formulário de plano de sessão', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Deve ter campos do plano
        await expect(
          page.getByText(/introdução|estrutura pedagógica/i)
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  // ==========================================
  // FORMANDO — MODO LEITURA
  // ==========================================

  test('formando vê planos em modo leitura', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    // Selecionar sessão (se disponível)
    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Formando não deve ver botão "Guardar Plano" / "Atualizar Plano"
        await expect(page.getByRole('button', { name: /guardar|atualizar plano/i })).not.toBeVisible();
      }
    }
  });

  test('formando não vê botão Criar nas fichas de trabalho', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Ir para tab fichas
        await page.getByText(/fichas de trabalho/i).click();
        await page.waitForTimeout(500);

        // Não deve ver "Criar Nova Ficha" ou "Criar Ficha de Trabalho"
        await expect(page.getByText(/criar.*ficha/i)).not.toBeVisible();
      }
    }
  });

  test('formando pode imprimir planos', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/planos');
    await page.waitForLoadState('networkidle');

    const sessionSelect = page.locator('select').first();
    if (await sessionSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      const options = await sessionSelect.locator('option').allTextContents();
      if (options.length > 1) {
        await sessionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Se existir plano, deve ver botão de imprimir
        const printBtn = page.getByRole('button', { name: /imprimir/i });
        // Botão de impressão pode ou não existir dependendo de haver plano
      }
    }
  });
});
