import { expect, test } from '@playwright/test';

test('deve abrir a tela de login do FarmaLembra', async ({ page }) => {
  // Acessa a página inicial do aplicativo.
  await page.goto('/');

  // Confirma que o usuário foi direcionado para a tela de login.
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta!' })).toBeVisible();

  // Confirma que os campos de acesso estão disponíveis.
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.locator('input[name="senha"]')).toBeVisible();

  // Confirma que o botão de login está disponível.
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('deve permitir alternar para o cadastro', async ({ page }) => {
  await page.goto('/');

  // Abre o formulário de cadastro.
  await page.getByRole('button', { name: 'Criar conta' }).click();

  // Confirma que os campos específicos do cadastro aparecem.
  await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible();
  await expect(page.getByLabel('Nome completo')).toBeVisible();
  await expect(page.getByLabel('Confirmar senha')).toBeVisible();
});
