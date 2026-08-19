import { test, expect } from '@playwright/test';

test('cria sala e navega para o controlador', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Flip7 Score4All')).toBeVisible();

  await page.getByRole('button', { name: 'Criar Nova Sala' }).click();

  await expect(page.getByText(/SALA:/)).toBeVisible();
  await expect(page.getByText('Ranking & Ações')).toBeVisible();
  
  // Adiciona um jogador presencial
  await page.getByPlaceholder('Adicionar jogador presencial...').fill('Bob');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByText('Bob')).toBeVisible();
  
  // Adiciona rodada para Bob
  await page.getByRole('button', { name: '+ Rodada' }).click();
  await expect(page.getByText('Cartas de Número')).toBeVisible();
  
  await page.getByText('10', { exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  
  await expect(page.getByText('10 pontos')).toBeVisible();
});
