import { test as base, expect, type Page } from '@playwright/test';

// Credenciais de teste — devem existir no Firebase
// Para criar estes utilizadores, execute o setup descrito em DOCUMENTATION.md
export const TEST_USERS = {
  admin: {
    email: 'admin@intellico.academy',
    password: 'Admin123',
    role: 'admin' as const,
  },
  responsavel: {
    email: 'responsavel@intellico.academy',
    password: 'Responsavel123',
    role: 'responsavel' as const,
  },
  formador: {
    email: 'formador@intellico.academy',
    password: 'Formador123',
    role: 'formador' as const,
  },
  formando: {
    email: 'formando@intellico.academy',
    password: 'Formando123',
    role: 'formando' as const,
  },
  regulador: {
    email: 'regulador@intellico.academy',
    password: 'Regulador123',
    role: 'regulador' as const,
  },
};

/**
 * Helper para fazer login (fluxo de 2 passos).
 * Passo 1: email + "Continuar"
 * Passo 2: password + "Entrar"
 * Lança erro se a conta não existir (campo password não aparece).
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  // Passo 1: preencher email e clicar "Continuar"
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill(email);
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Esperar pelo passo 2 ou erro
  const passwordInput = page.locator('input[type="password"]');
  const errorDiv = page.locator('form .bg-rose-50').or(page.locator('[class*="CardContent"] .bg-rose-50'));

  // Esperar que um dos dois apareça
  await Promise.race([
    passwordInput.waitFor({ timeout: 15000 }),
    errorDiv.waitFor({ timeout: 15000 }),
  ]);

  // Se apareceu erro em vez de password, a conta não existe
  if (await errorDiv.isVisible().catch(() => false) && !await passwordInput.isVisible().catch(() => false)) {
    throw new Error(`Conta não encontrada para ${email}. Crie o utilizador de teste no Firebase.`);
  }

  // Passo 2: preencher password e submeter
  await passwordInput.fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  // Esperar navegação pós-login ou erro de password
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  } catch {
    // Verificar se há erro de password
    if (await errorDiv.isVisible().catch(() => false)) {
      throw new Error(`Login falhou para ${email}. Verifique a password.`);
    }
    throw new Error(`Login timeout para ${email}.`);
  }
}

/**
 * Verifica se o login funciona para um utilizador.
 * Retorna true se conseguiu fazer login, false se a conta não existe.
 */
export async function canLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await login(page, email, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper para fazer logout via botão na sidebar.
 */
export async function logout(page: Page) {
  const logoutBtn = page.getByRole('button', { name: /terminar sessão/i });
  await logoutBtn.click();
  await page.waitForURL(/\/login/, { timeout: 10000 });
}

// Fixture que já faz login como responsável
type AuthFixtures = {
  responsavelPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  responsavelPage: async ({ page }, use) => {
    await login(page, TEST_USERS.responsavel.email, TEST_USERS.responsavel.password);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },
});

export { expect };
