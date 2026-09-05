import { expect, Page } from '@playwright/test';

type SetupOptions = {
  name: string;
  isPlaying: boolean;
};

export async function createRoomAsController(page: Page, { name, isPlaying }: SetupOptions): Promise<string> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Criar Nova Sala' }).click();
  await page.getByPlaceholder('Digite seu nome...').fill(name);
  const toggle = page.locator('#participate-toggle');
  const checked = await toggle.isChecked();
  if (isPlaying !== checked) {
    await toggle.click();
  }
  await page.getByRole('button', { name: /Entrar na Sala|Confirmar configuração do controlador/i }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]+\/controller/i);
  await expect(page.getByText(/SALA:/)).toBeVisible();
  const roomCodeText = await page.locator('.room-code').innerText();
  return roomCodeText.replace('SALA:', '').trim();
}

export async function addPlayer(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder('Adicionar jogador presencial...').fill(name);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('.player-row', { hasText: name })).toBeVisible();
}

export async function registerPlayerScore(page: Page, playerName: string, cardValue: number): Promise<void> {
  const row = page.locator('.player-row', { hasText: playerName });
  await row.getByRole('button', { name: '+ Rodada' }).click();
  await page.getByRole('button', { name: `Carta ${cardValue}` }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await page.getByRole('button', { name: 'Finalizar Rodada' }).click();
}
