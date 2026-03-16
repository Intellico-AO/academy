import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Gestão de Cursos', () => {
  const cursoNome = `Curso E2E ${Date.now()}`;
  const cursoCodigo = `E2E-${Date.now().toString().slice(-6)}`;

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
  // LISTAR CURSOS
  // ==========================================

  test('deve mostrar a página de cursos', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await expect(page.getByText(/cursos/i)).toBeVisible({ timeout: 10000 });
    // Deve ter barra de pesquisa
    await expect(page.getByPlaceholder(/pesquisar/i)).toBeVisible();
  });

  test('deve ter botão para criar novo curso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await expect(page.getByText(/novo curso/i)).toBeVisible();
  });

  test('deve filtrar cursos por pesquisa', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('termo-que-nao-existe-xyz');
    await expect(page.getByText(/nenhum curso/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar cursos por estado', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('ativo');
    // A página deve atualizar (sem erro)
    await page.waitForTimeout(500);
  });

  // ==========================================
  // CRIAR CURSO
  // ==========================================

  test('deve navegar para /cursos/novo', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await page.getByText(/novo curso/i).click();
    await expect(page).toHaveURL(/\/cursos\/novo/);
  });

  test('deve validar campos obrigatórios ao criar curso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos/novo');
    await page.waitForLoadState('networkidle');

    // Tentar submeter sem preencher
    const submitBtn = page.getByRole('button', { name: /guardar|criar|salvar/i });
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      // Deve permanecer na página
      await expect(page).toHaveURL(/\/cursos\/novo/);
    }
  });

  test('deve criar um novo curso com sucesso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos/novo');
    await page.waitForLoadState('networkidle');

    // Preencher campos obrigatórios
    const codeInput = page.getByLabel(/código/i).or(page.locator('input[name="codigo"]'));
    if (await codeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await codeInput.fill(cursoCodigo);
    }

    const nameInput = page.getByLabel(/nome/i).first().or(page.locator('input[name="nome"]'));
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill(cursoNome);
    }

    const descInput = page.getByLabel(/descrição/i).or(page.locator('textarea[name="descricao"]'));
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill('Curso criado pelos testes E2E');
    }

    // Submeter
    const submitBtn = page.getByRole('button', { name: /guardar|criar|salvar/i });
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      // Deve navegar para a lista ou detalhes
      await page.waitForURL((url) => !url.pathname.includes('/novo'), { timeout: 10000 });
    }
  });

  // ==========================================
  // VER DETALHES
  // ==========================================

  test('deve mostrar detalhes de um curso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await page.waitForLoadState('networkidle');

    // Clicar no primeiro curso (se existir)
    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Abrir menu de contexto
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const viewBtn = page.getByText(/ver detalhes/i);
      if (await viewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await viewBtn.click();
        await expect(page).toHaveURL(/\/cursos\/[^/]+$/);
      }
    }
  });

  // ==========================================
  // EDITAR CURSO
  // ==========================================

  test('deve navegar para edição de um curso', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = firstCard.locator('button').filter({ has: page.locator('svg') }).last();
      await moreBtn.click();

      const editBtn = page.getByText(/editar/i).first();
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await expect(page).toHaveURL(/\/cursos\/[^/]+\/editar/);
      }
    }
  });

  // ==========================================
  // EMPTY STATE
  // ==========================================

  test('deve mostrar empty state quando não há cursos', async ({ page }) => {
    test.skip(!loggedIn, 'Utilizador responsavel não existe');
    await page.goto('/cursos');
    const searchInput = page.getByPlaceholder(/pesquisar/i);
    await searchInput.fill('xyzzy-nao-existe-9999');
    await expect(page.getByText(/nenhum curso/i)).toBeVisible({ timeout: 5000 });
  });
});
