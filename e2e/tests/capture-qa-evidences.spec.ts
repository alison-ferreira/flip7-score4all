import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createRoomAsController } from './helpers/controllerHelpers';

const EVIDENCES_DIR = path.resolve(__dirname, '../../tasks/prd-edicao-pontuacao-rodada/evidences');

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCES_DIR)) {
    fs.mkdirSync(EVIDENCES_DIR, { recursive: true });
  }
});

test.describe('Captura de Evidências de QA - Edição de Pontuação da Rodada', () => {
  test('Fluxo completo de QA e captura de evidências visuais', async ({ browser }) => {
    const controllerContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const controllerPage = await controllerContext.newPage();

    const viewerContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const viewerPage = await viewerContext.newPage();

    // 1. Criar sala
    const roomCode = await createRoomAsController(controllerPage, { name: 'Admin', isPlaying: false });

    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await controllerPage.getByRole('button', { name: 'Add' }).click();
    await expect(controllerPage.getByText('Alice')).toBeVisible();

    // Entrar como espectador
    await viewerPage.goto(`/room/${roomCode}`);
    await expect(viewerPage.getByText(`Entrar na Sala ${roomCode}`)).toBeVisible();
    await viewerPage.getByPlaceholder('Seu Nome').fill('Bob');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();

    const aliceRowController = controllerPage.locator('.player-row', { hasText: 'Alice' });

    // 2. Marcar 30 pontos para Alice (10 + 12 + bonus +8)
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.getByText('Cartas de Número')).toBeVisible();
    await controllerPage.locator('.cards-grid').getByText('10', { exact: true }).click();
    await controllerPage.locator('.cards-grid').getByText('12', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+8', { exact: true }).click();
    await expect(controllerPage.locator('.calc-res')).toHaveText('30');
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // 3. Reabrir modal de Alice (CA-01) - deve estar preenchido com 30
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.getByText('Cartas de Número')).toBeVisible();
    await expect(controllerPage.locator('.calc-res')).toHaveText('30');
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '01-ca-01-modal-pre-filled.png') });

    // 4. Alterar seleção para 45 pontos (adicionar 5 e bônus +10) e confirmar (CA-02)
    await controllerPage.locator('.cards-grid').getByText('5', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+10', { exact: true }).click();
    await expect(controllerPage.locator('.calc-res')).toHaveText('45');
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    await expect(aliceRowController.getByText('0 pontos')).toBeVisible();
    await expect(aliceRowController.getByTestId('controller-round-draft-badge')).toHaveText('+45 rodada');
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '02-ca-02-score-replaced-45pts.png') });

    // 5. Espectador visualiza 0 pontos consolidados e badge "+45 rodada" (CA-04)
    const aliceRowViewer = viewerPage.locator('.player-row', { hasText: 'Alice' });
    await expect(aliceRowViewer.getByText('0 pontos')).toBeVisible();
    await expect(aliceRowViewer.getByTestId('viewer-round-draft-badge')).toHaveText('+45 rodada');
    await viewerPage.screenshot({ path: path.join(EVIDENCES_DIR, '03-ca-04-viewer-pending-score.png') });

    // 6. Encerramento da rodada (CA-05) - pontos consolidados 45
    await controllerPage.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(controllerPage.getByText('Rodada 2')).toBeVisible();
    await expect(aliceRowController.getByText('45 pontos')).toBeVisible();
    await expect(aliceRowController.getByTestId('controller-round-draft-badge')).not.toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '04-ca-05-round-finished-consolidated.png') });

    // 7. Rodada 2: Reabrir modal de Alice (CA-03) - formulário deve estar limpo e zerado
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.getByText('Cartas de Número')).toBeVisible();
    await expect(controllerPage.locator('.calc-res')).toHaveText('0');
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '05-ca-03-round-2-modal-cleared.png') });
    await controllerPage.getByRole('button', { name: 'Cancelar' }).click();

    await controllerContext.close();
    await viewerContext.close();
  });

  test('Captura de Responsividade (Breakpoints Mobile)', async ({ browser }) => {
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobilePage = await mobileContext.newPage();

    await createRoomAsController(mobilePage, { name: 'Admin', isPlaying: false });

    await mobilePage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice Mobile');
    await mobilePage.getByRole('button', { name: 'Add' }).click();

    const aliceRow = mobilePage.locator('.player-row', { hasText: 'Alice Mobile' });
    await aliceRow.getByRole('button', { name: '+ Rodada' }).click();
    await mobilePage.locator('.cards-grid').getByText('7', { exact: true }).click();
    await mobilePage.getByRole('button', { name: 'Confirmar' }).click();

    await mobilePage.screenshot({ path: path.join(EVIDENCES_DIR, '06-responsive-mobile-controller.png') });

    await mobileContext.close();
  });
});
