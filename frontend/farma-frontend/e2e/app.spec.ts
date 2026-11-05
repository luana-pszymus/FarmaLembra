import { expect, test } from '@playwright/test';

test('deve abrir a página inicial do FarmaLembra', async ({ page }) => {
  // Acessa a página inicial do aplicativo.
  await page.goto('/');

  // Verifica se a saudação da página inicial aparece.
  await expect(page.getByRole('heading', { name: /Olá!/ })).toBeVisible();

  // Verifica se a marca do aplicativo aparece.
  await expect(page.getByText('FarmaLembra', { exact: true })).toBeVisible();
});
