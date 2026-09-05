import { test, expect } from '@playwright/test';
import { createRoomAsController, addPlayer, registerPlayerScore } from './helpers/controllerHelpers';

test.describe('Controlador-Jogador E2E', () => {
  test('E2E-01: Controlador cria sala, informa nome e opta por jogar', async ({ page }) => {
    await createRoomAsController(page, { name: 'Ana', isPlaying: true });
    await expect(page.getByText('Mesa de Ana')).toBeVisible();
    const anaRow = page.locator('.player-row', { hasText: 'Ana' });
    await expect(anaRow.getByText('Você')).toBeVisible();
    await expect(anaRow.getByTestId('controller-badge')).toBeVisible();
  });

  test('E2E-02: Controlador cria sala e opta por não jogar', async ({ page }) => {
    await createRoomAsController(page, { name: 'Bruno', isPlaying: false });
    await addPlayer(page, 'Carlos');
    const carlosRow = page.locator('.player-row', { hasText: 'Carlos' });
    await expect(carlosRow).toBeVisible();
    await expect(carlosRow.getByRole('button', { name: '+ Rodada' })).toBeVisible();
    const ghostRow = page.locator('[data-testid="ghost-controller-row"]', { hasText: 'Bruno' });
    await expect(ghostRow).toBeVisible();
    await expect(ghostRow).toHaveClass(/opacity-50/);
    await expect(page.locator('.player-row').first()).toContainText('Carlos');
    await expect(page.locator('.player-row').last()).toContainText('Bruno');
  });

  test('E2E-03: Controlador-jogador registra própria pontuação', async ({ page }) => {
    await createRoomAsController(page, { name: 'Ana', isPlaying: true });
    const anaRow = page.locator('.player-row', { hasText: 'Ana' });
    await anaRow.getByRole('button', { name: '+ Rodada' }).click();
    await page.getByRole('button', { name: 'Carta 7' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(anaRow.getByTestId('controller-round-draft-badge')).toContainText('+7 rodada');
    await page.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(anaRow.getByText('7 pontos')).toBeVisible();
    await expect(page.getByText('Controlador - Rodada 2')).toBeVisible();
  });

  test('E2E-04: Controlador-jogador abre e fecha modal de visualização', async ({ page }) => {
    await createRoomAsController(page, { name: 'Ana', isPlaying: true });
    await page.getByRole('button', { name: 'Abrir visão de jogador' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Visão do Jogador')).toBeVisible();
    await expect(dialog.getByText(/Seu Status: Jogando/i)).toBeVisible();
    await dialog.getByRole('button', { name: 'Fechar visão de jogador' }).click();
    await expect(dialog).not.toBeVisible();
    await page.getByRole('button', { name: 'Abrir visão de jogador' }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('E2E-05: Controlador-jogador se remove da partida', async ({ page }) => {
    await createRoomAsController(page, { name: 'Ana', isPlaying: true });
    await addPlayer(page, 'Carlos');
    const anaRow = page.locator('.player-row', { hasText: 'Ana' });
    await anaRow.getByRole('button', { name: '✕' }).click();
    const ghostAna = page.locator('[data-testid="ghost-controller-row"]', { hasText: 'Ana' });
    await expect(ghostAna).toBeVisible();
    await expect(ghostAna).toHaveClass(/opacity-50/);
    const carlosRow = page.locator('.player-row', { hasText: 'Carlos' });
    await expect(carlosRow).toBeVisible();
    await expect(carlosRow.getByRole('button', { name: '+ Rodada' })).toBeVisible();
  });

  test('E2E-06: Controlador reinicia partida e muda participação', async ({ page }) => {
    await createRoomAsController(page, { name: 'Ana', isPlaying: true });
    await registerPlayerScore(page, 'Ana', 10);
    await expect(page.getByText('Controlador - Rodada 2')).toBeVisible();
    await page.getByRole('button', { name: 'Reiniciar partida' }).click();
    const resetModal = page.getByRole('dialog');
    await expect(resetModal.getByText('Reiniciar Partida')).toBeVisible();
    await resetModal.locator('#reset-participate-toggle').uncheck();
    await resetModal.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByText('Controlador - Rodada 1')).toBeVisible();
    const ghostAna = page.locator('[data-testid="ghost-controller-row"]', { hasText: 'Ana' });
    await expect(ghostAna).toBeVisible();
    await expect(ghostAna).toHaveClass(/opacity-50/);
  });

  test('E2E-07: Visualizador vê badge de controlador e não-jogador em cinza', async ({ browser }) => {
    const controllerContext = await browser.newContext();
    const controllerPage = await controllerContext.newPage();
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const code = await createRoomAsController(controllerPage, { name: 'Bruno', isPlaying: false });
    await addPlayer(controllerPage, 'Carlos');
    await viewerPage.goto(`/room/${code}`);
    await viewerPage.getByPlaceholder('Seu Nome').fill('Daniel');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();
    const ghostBruno = viewerPage.locator('[data-testid="ghost-controller-row"]', { hasText: 'Bruno' });
    await expect(ghostBruno).toBeVisible();
    await expect(ghostBruno.getByTestId('controller-badge')).toBeVisible();
    await expect(ghostBruno).toHaveClass(/opacity-50/);
    await expect(viewerPage.locator('.player-row').last()).toContainText('Bruno');
    await controllerContext.close();
    await viewerContext.close();
  });
});
