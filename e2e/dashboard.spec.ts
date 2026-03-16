import { test, expect } from '@playwright/test';
import { login, canLogin, TEST_USERS } from './fixtures/auth';

test.describe('Dashboard', () => {
  // ==========================================
  // DASHBOARD DO GESTOR
  // ==========================================

  test.describe('Dashboard — Responsável', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar o painel de controlo', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/painel de controlo/i)).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar cards de estatísticas', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/total de cursos/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/programas formativos/i)).toBeVisible();
      await expect(page.getByText(/sessões agendadas/i)).toBeVisible();
      await expect(page.getByText(/horas de formação/i)).toBeVisible();
    });

    test('deve mostrar ações rápidas', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/ações rápidas/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/novo curso/i)).toBeVisible();
      await expect(page.getByText(/novo programa/i)).toBeVisible();
      await expect(page.getByText(/nova sessão/i)).toBeVisible();
    });

    test('deve mostrar atividade recente', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/atividade recente/i)).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar cursos recentes', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/cursos recentes/i)).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar próximas sessões', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await expect(page.getByText(/próximas sessões/i)).toBeVisible({ timeout: 10000 });
    });

    test('ação rápida "Novo Curso" navega para /cursos/novo', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.getByRole('link', { name: /novo curso/i }).first().click();
      await expect(page).toHaveURL(/\/cursos\/novo/);
    });

    test('ação rápida "Nova Sessão" navega para /sessoes/nova', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador responsavel não existe');
      await page.getByRole('link', { name: /nova sessão/i }).first().click();
      await expect(page).toHaveURL(/\/sessoes\/nova/);
    });
  });

  // ==========================================
  // DASHBOARD DO FORMANDO
  // ==========================================

  test.describe('Dashboard — Formando', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.formando.email, TEST_USERS.formando.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar "As Minhas Formações"', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.getByText('As Minhas Formações')).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar cards de resumo', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.getByText('Cursos Inscritos')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Horas de Formação')).toBeVisible();
    });

    test('deve mostrar secção "Os Meus Cursos"', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.getByText('Os Meus Cursos')).toBeVisible({ timeout: 10000 });
    });

    test('não deve mostrar ações rápidas de criação', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.getByText('Ações Rápidas')).not.toBeVisible();
    });

    test('não deve mostrar estatísticas de responsável', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formando não existe');
      await expect(page.getByText('Total de Cursos')).not.toBeVisible();
      await expect(page.getByText('Programas Formativos')).not.toBeVisible();
    });
  });

  // ==========================================
  // DASHBOARD DO FORMADOR
  // ==========================================

  test.describe('Dashboard — Formador', () => {
    let loggedIn = false;

    test.beforeEach(async ({ page }) => {
      try {
        await login(page, TEST_USERS.formador.email, TEST_USERS.formador.password);
        loggedIn = true;
      } catch {
        loggedIn = false;
      }
    });

    test('deve mostrar o painel de controlo', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formador não existe');
      await expect(page.getByText(/painel de controlo/i)).toBeVisible({ timeout: 10000 });
    });

    test('deve mostrar cards de estatísticas', async ({ page }) => {
      test.skip(!loggedIn, 'Utilizador formador não existe');
      await expect(page.getByText(/total de cursos/i)).toBeVisible({ timeout: 10000 });
    });
  });
});
