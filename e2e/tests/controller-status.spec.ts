import { test, expect } from '@playwright/test';
import { createRoomAsController } from './helpers/controllerHelpers';

test.describe('E2E-01: Interação e UI do Controlador (Status e Dealer)', () => {
  test('Alternar status e definir dealer com atualização automática na UI do controlador', async ({ page }) => {
    // 1. Criar a sala
    await createRoomAsController(page, { name: 'Admin', isPlaying: false });

    // 2. Adicionar jogadores presenciais Alice e Bob
    await page.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    await page.getByPlaceholder('Adicionar jogador presencial...').fill('Bob');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    const aliceRow = page.locator('.player-row', { hasText: 'Alice' });
    const bobRow = page.locator('.player-row', { hasText: 'Bob' });

    // 3. Status inicial deve ser "Jogando"
    await expect(aliceRow.getByRole('button', { name: /Status atual: Jogando/i })).toBeVisible();
    await expect(bobRow.getByRole('button', { name: /Status atual: Jogando/i })).toBeVisible();

    // 4. Alternar status de Alice para "Parou" (CA-01)
    await aliceRow.getByRole('button', { name: /Status atual: Jogando/i }).click();
    await aliceRow.getByRole('button', { name: 'Parou' }).click();
    await expect(aliceRow.getByRole('button', { name: /Status atual: Parou/i })).toBeVisible();

    // 5. Alternar status de Alice para "Estourou" (Garantir apenas 1 ativo por vez)
    await aliceRow.getByRole('button', { name: /Status atual: Parou/i }).click();
    await aliceRow.getByRole('button', { name: 'Estourou' }).click();
    await expect(aliceRow.getByRole('button', { name: /Status atual: Estourou/i })).toBeVisible();

    // 6. Definir Alice como Dealer (CA-04)
    await aliceRow.getByRole('button', { name: 'Definir como Dealer' }).click();
    await expect(aliceRow.getByRole('button', { name: 'Dealer atual' })).toBeVisible();
    await expect(bobRow.getByRole('button', { name: 'Definir como Dealer' })).toBeVisible();

    // 7. Definir Bob como Dealer (CA-05) -> Alice perde o Dealer
    await bobRow.getByRole('button', { name: 'Definir como Dealer' }).click();
    await expect(bobRow.getByRole('button', { name: 'Dealer atual' })).toBeVisible();
    await expect(aliceRow.getByRole('button', { name: 'Definir como Dealer' })).toBeVisible();

    // 8. Finalizar rodada -> Todos retornam para "Jogando" (CA-03)
    await page.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(page.getByText('Rodada 2')).toBeVisible();
    await expect(aliceRow.getByRole('button', { name: /Status atual: Jogando/i })).toBeVisible();
    await expect(bobRow.getByRole('button', { name: /Status atual: Jogando/i })).toBeVisible();
  });
});
