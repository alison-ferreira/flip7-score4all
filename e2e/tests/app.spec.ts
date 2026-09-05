import { test, expect } from '@playwright/test';
import { createRoomAsController } from './helpers/controllerHelpers';

test('cria sala e navega para o controlador', async ({ page }) => {
  await createRoomAsController(page, { name: 'Admin', isPlaying: false });

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
  const bobRow = page.locator('.player-row', { hasText: 'Bob' });
  await expect(bobRow.getByText('0 pontos')).toBeVisible();
  await expect(bobRow.getByText('+10 rodada')).toBeVisible();
});
