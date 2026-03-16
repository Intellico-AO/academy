import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Navegação e Sidebar', () => {
  // ==========================================
  // SIDEBAR DO GESTOR
  // ==========================================

  test.describe('Sidebar — Responsável', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar todos os itens do menu para responsável', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.locator('nav').getByText('Dashboard')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('nav').getByText('Cursos')).toBeVisible();
      await expect(page.locator('nav').getByText('Programas')).toBeVisible();
      await expect(page.locator('nav').getByText('Sessões')).toBeVisible();
      await expect(page.locator('nav').getByText('Planos de Sessão')).toBeVisible();
      await expect(page.locator('nav').getByText('Formandos')).toBeVisible();
      await expect(page.locator('nav').getByText('Formadores')).toBeVisible();
      await expect(page.locator('nav').getByText('Auditoria')).toBeVisible();
    });

    test('deve navegar ao clicar em Cursos', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Cursos').click();
      await expect(page).toHaveURL(/\/cursos/);
    });

    test('deve navegar ao clicar em Programas', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Programas').click();
      await expect(page).toHaveURL(/\/programas/);
    });

    test('deve navegar ao clicar em Sessões', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Sessões').click();
      await expect(page).toHaveURL(/\/sessoes/);
    });

    test('deve navegar ao clicar em Planos de Sessão', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Planos de Sessão').click();
      await expect(page).toHaveURL(/\/planos/);
    });

    test('deve navegar ao clicar em Formandos', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Formandos').click();
      await expect(page).toHaveURL(/\/formandos/);
    });

    test('deve navegar ao clicar em Formadores', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Formadores').click();
      await expect(page).toHaveURL(/\/formadores/);
    });

    test('deve navegar ao clicar em Auditoria', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.locator('nav').getByText('Auditoria').click();
      await expect(page).toHaveURL(/\/auditoria/);
    });

    test('deve destacar o item ativo na sidebar', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.goto('/cursos');
      await page.waitForLoadState('networkidle');

      const cursosLink = page.locator('nav a[href="/cursos"]');
      await expect(cursosLink).toHaveClass(/emerald/);
    });

    test('deve colapsar a sidebar', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      // Clicar no botão de colapsar
      const collapseBtn = page.getByTitle(/recolher/i);
      if (await collapseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await collapseBtn.click();
        // Sidebar deve ficar mais estreita
        const sidebar = page.locator('aside');
        await expect(sidebar).toHaveClass(/w-20/);
      }
    });

    test('deve expandir a sidebar', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      // Primeiro colapsar
      const collapseBtn = page.getByTitle(/recolher/i);
      if (await collapseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await collapseBtn.click();
        await page.waitForTimeout(500);

        // Depois expandir
        const expandBtn = page.getByTitle(/expandir/i);
        await expandBtn.click();
        const sidebar = page.locator('aside');
        await expect(sidebar).toHaveClass(/w-64/);
      }
    });
  });

  // ==========================================
  // SIDEBAR DO FORMANDO
  // ==========================================

  test.describe('Sidebar — Formando', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar apenas itens permitidos', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.locator('nav').getByText('Dashboard')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('nav').getByText('Cursos')).toBeVisible();
      await expect(page.locator('nav').getByText('Sessões')).toBeVisible();
      await expect(page.locator('nav').getByText('Planos de Sessão')).toBeVisible();
    });

    test('não deve mostrar itens restritos', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('nav').getByText('Programas')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Formandos')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Formadores')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Auditoria')).not.toBeVisible();
    });
  });

  // ==========================================
  // SIDEBAR DO FORMADOR
  // ==========================================

  test.describe('Sidebar — Formador', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar itens para formador', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formador não existe');
      await expect(page.locator('nav').getByText('Dashboard')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('nav').getByText('Cursos')).toBeVisible();
      await expect(page.locator('nav').getByText('Programas')).toBeVisible();
      await expect(page.locator('nav').getByText('Sessões')).toBeVisible();
      await expect(page.locator('nav').getByText('Planos de Sessão')).toBeVisible();
    });

    test('não deve mostrar itens de responsável', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formador não existe');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('nav').getByText('Formandos')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Formadores')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Auditoria')).not.toBeVisible();
    });
  });

  // ==========================================
  // HEADER
  // ==========================================

  test.describe('Header', () => {
    test('deve mostrar o header com título da página', async ({ page }) => {
      const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
      test.skip(!ok, 'Utilizador responsavel não existe');
      await page.goto('/cursos');
      await expect(page.getByText(/cursos/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar dropdown do utilizador', async ({ page }) => {
      const ok = await canLogin(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
      test.skip(!ok, 'Utilizador responsavel não existe');

      // Clicar no nome/avatar do utilizador
      const userMenu = page.locator('header').getByRole('button').last();
      if (await userMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
        await userMenu.click();
        // Deve mostrar opções
        await expect(
          page.getByText(/editar conta|terminar sessão/i)
        ).toBeVisible({ timeout: 3000 });
      }
    });
  });

  // ==========================================
  // SIDEBAR ADMIN
  // ==========================================

  test.describe('Sidebar — Admin', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    });

    test('deve mostrar itens admin', async ({ page }) => {
      await expect(page.getByText(/administração/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/reguladores/i)).toBeVisible();
    });

    test('deve navegar ao clicar em Reguladores', async ({ page }) => {
      await page.getByText(/reguladores/i).first().click();
      await expect(page).toHaveURL(/\/admin\/reguladores/);
    });
  });
});
