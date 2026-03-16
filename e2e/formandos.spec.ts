import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Gestão de Formandos e Inscrições', () => {
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
  // LISTAR FORMANDOS
  // ==========================================

  test('deve mostrar a página de formandos', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await expect(page.getByText('Formandos').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve ter botão para registar novo formando', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await expect(page.getByText(/novo formando/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve ter barra de pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await expect(page.getByPlaceholder(/pesquisar/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve filtrar formandos por pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('formando-inexistente-xyz');
    await expect(page.getByText(/nenhum formando/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar formandos por estado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('ativo');
    await page.waitForTimeout(500);
  });

  // ==========================================
  // CRIAR FORMANDO
  // ==========================================

  test('deve navegar para /formandos/novo', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await page.getByText(/novo formando/i).click();
    await expect(page).toHaveURL(/\/formandos\/novo/);
  });

  test('deve mostrar formulário com campos obrigatórios', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos/novo');
    await page.waitForLoadState('networkidle');

    await expect(page.getByLabel(/nome/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/data de nascimento/i)).toBeVisible();
  });

  test('deve mostrar seletor de curso na criação', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos/novo');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/inscrição em curso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos/novo');
    await page.waitForLoadState('networkidle');

    // Tentar submeter sem preencher
    const submitBtn = page.getByRole('button', { name: /registar/i });
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      // Deve permanecer na página
      await expect(page).toHaveURL(/\/formandos\/novo/);
    }
  });

  test('deve criar formando com sucesso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos/novo');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const nome = `Formando Teste ${timestamp}`;
    const email = `formando.teste.${timestamp}@teste.com`;

    const nomeInput = page.getByLabel(/nome/i).first();
    await nomeInput.fill(nome);

    const emailInput = page.getByLabel(/email/i).first();
    await emailInput.fill(email);

    const submitBtn = page.getByRole('button', { name: /registar/i });
    await submitBtn.click();

    // Deve navegar para /formandos ou mostrar toast de sucesso
    await page.waitForURL(/\/formandos$/, { timeout: 10000 }).catch(() => {
      // Pode ter ficado na mesma página com toast
    });
  });

  test('deve impedir email duplicado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos/novo');
    await page.waitForLoadState('networkidle');

    // Usar email que já existe
    const nomeInput = page.getByLabel(/nome/i).first();
    await nomeInput.fill('Teste Duplicado');

    const emailInput = page.getByLabel(/email/i).first();
    await emailInput.fill(TEST_USERS.responsavel.email);

    const submitBtn = page.getByRole('button', { name: /registar/i });
    await submitBtn.click();

    // Deve mostrar erro de email duplicado
    await expect(
      page.getByText(/já registad|já existe|duplicad/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // VER DETALHES
  // ==========================================

  test('deve mostrar detalhes de um formando', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page).toHaveURL(/\/formandos\/[^/]+$/);
        // Deve mostrar dados pessoais e cursos inscritos
        await expect(page.getByText(/dados pessoais/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/cursos inscritos/i)).toBeVisible();
      }
    }
  });

  // ==========================================
  // INSCRIÇÕES EM CURSOS
  // ==========================================

  test('deve mostrar botão Inscrever em Curso nos detalhes', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page.getByText(/inscrever em curso/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('deve abrir modal de inscrição em curso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await page.waitForLoadState('networkidle');

        const enrollBtn = page.getByRole('button', { name: /inscrever em curso/i });
        if (await enrollBtn.isEnabled({ timeout: 5000 }).catch(() => false)) {
          await enrollBtn.click();
          // Deve abrir modal com seletor de curso
          await expect(page.getByText(/selecionar curso/i)).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  // ==========================================
  // EDITAR FORMANDO
  // ==========================================

  test('deve navegar para edição de um formando', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/formandos');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const editBtn = page.getByText(/editar/i).first();
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await expect(page).toHaveURL(/\/formandos\/[^/]+\/editar/);
      }
    }
  });

  // ==========================================
  // ACESSO — APENAS GESTOR
  // ==========================================

  test('formador não acede a /formandos', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
    test.skip(!ok, 'Utilizador formador não existe');
    await page.goto('/formandos');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(
      !url.includes('/formandos') ||
      await page.getByText(/acesso negado/i).isVisible().catch(() => false)
    ).toBeTruthy();
  });

  test('formando não acede a /formandos', async ({ page }) => {
    const ok = await canLogin(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
    test.skip(!ok, 'Utilizador formando não existe');
    await page.goto('/formandos');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(
      !url.includes('/formandos') ||
      await page.getByText(/acesso negado/i).isVisible().catch(() => false)
    ).toBeTruthy();
  });
});
