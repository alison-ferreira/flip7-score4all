import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createRoomAsController, addPlayer } from './helpers/controllerHelpers';

const EVIDENCES_DIR = path.resolve(__dirname, '../../tasks/prd-controlador-jogador/evidences');

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCES_DIR)) {
    fs.mkdirSync(EVIDENCES_DIR, { recursive: true });
  }
});

test.describe('Captura de Evidências QA - Controlador como Jogador', () => {
  test('Fluxo completo de validação dos critérios de aceitação e captura de evidências', async ({ browser }) => {
    const controllerContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const controllerPage = await controllerContext.newPage();

    const viewerContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const viewerPage = await viewerContext.newPage();

    // CA-01: Nome obrigatório na criação de sala
    await controllerPage.goto('/');
    await controllerPage.getByRole('button', { name: 'Criar Nova Sala' }).click();
    const submitBtn = controllerPage.getByRole('button', { name: /Entrar na Sala|Confirmar configuração/i });
    await expect(submitBtn).toBeDisabled();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '01-ca-01-setup-name-mandatory.png') });

    // Preenche nome "Ana" e opta por jogar (CA-02, CA-04, CA-05)
    await controllerPage.getByPlaceholder('Digite seu nome...').fill('Ana');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await expect(controllerPage).toHaveURL(/\/room\/[A-Z0-9]+\/controller/i);
    await expect(controllerPage.getByText(/SALA:/)).toBeVisible();
    await expect(controllerPage.getByText('Mesa de Ana')).toBeVisible();

    const anaRow = controllerPage.locator('.player-row', { hasText: 'Ana' });
    await expect(anaRow.getByText('Você')).toBeVisible();
    await expect(anaRow.getByTestId('controller-badge')).toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '02-ca-02-controller-as-player-ranking.png') });
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '04-ca-04-controller-badge-icon.png') });
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '05-ca-05-controller-voce-badge.png') });

    // CA-06: Registro de pontuação própria do controlador
    await anaRow.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.getByText('Cartas de Número')).toBeVisible();
    await controllerPage.getByRole('button', { name: 'Carta 7' }).click();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '06-ca-06-controller-score-keypad.png') });
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();
    await expect(anaRow.getByTestId('controller-round-draft-badge')).toContainText('+7 rodada');

    // CA-07: Alteração de status próprio
    await anaRow.getByRole('button', { name: /Status atual: Jogando/i }).click();
    await anaRow.getByRole('button', { name: 'Parou' }).click();
    await expect(anaRow.getByRole('button', { name: /Status atual: Parou/i })).toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '07-ca-07-controller-own-status.png') });

    // CA-08: Dealer próprio
    await anaRow.getByRole('button', { name: 'Definir como Dealer' }).click();
    await expect(anaRow.getByRole('button', { name: 'Dealer atual' })).toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '08-ca-08-controller-dealer.png') });

    // Finalizar rodada 1 para consolidar pontos
    await controllerPage.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(controllerPage.getByText('Controlador - Rodada 2')).toBeVisible();
    await expect(anaRow.getByText('7 pontos')).toBeVisible();

    // CA-09 e CA-10: Modal Visualizador fullscreen e fechamento
    await controllerPage.getByRole('button', { name: 'Abrir visão de jogador' }).click();
    const viewerModal = controllerPage.getByRole('dialog');
    await expect(viewerModal).toBeVisible();
    await expect(viewerModal.getByText('Visão do Jogador')).toBeVisible();
    await expect(viewerModal.getByText(/Seu Status: Jogando/i)).toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '09-ca-09-viewer-modal-fullscreen.png') });

    // Fechar via tecla Escape (CA-10)
    await controllerPage.keyboard.press('Escape');
    await expect(viewerModal).not.toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '10-ca-10-viewer-modal-closed.png') });

    // Adicionar outro jogador Carlos para testar remoção e ordem
    await addPlayer(controllerPage, 'Carlos');

    // CA-11: Remoção do controlador como jogador mantendo controle
    await anaRow.getByRole('button', { name: '✕' }).click();
    const ghostAna = controllerPage.locator('[data-testid="ghost-controller-row"]', { hasText: 'Ana' });
    await expect(ghostAna).toBeVisible();
    await expect(ghostAna).toHaveClass(/opacity-50/);
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '11-ca-11-controller-removed-to-ghost.png') });

    // CA-12: Nova Partida com ResetGameModal
    await controllerPage.getByRole('button', { name: 'Reiniciar partida' }).click();
    const resetModal = controllerPage.getByRole('dialog');
    await expect(resetModal.getByText('Reiniciar Partida')).toBeVisible();
    await controllerPage.screenshot({ path: path.join(EVIDENCES_DIR, '12-ca-12-reset-game-modal.png') });
    // Marca para participar novamente na nova partida
    const resetToggle = resetModal.locator('#reset-participate-toggle');
    if (!(await resetToggle.isChecked())) {
      await resetToggle.click();
    }
    await resetModal.getByRole('button', { name: 'Confirmar' }).click();
    await expect(controllerPage.getByText('Controlador - Rodada 1')).toBeVisible();
    await expect(controllerPage.locator('.player-row', { hasText: 'Ana' }).getByText('0 pontos')).toBeVisible();

    // Extrai código da sala e valida visão do visualizador (CA-03, CA-13)
    const roomCode = (await controllerPage.locator('.room-code').innerText()).replace('SALA:', '').trim();

    // Agora criamos uma sala com controlador não-jogando "Bruno" para CA-03 e CA-13
    const controllerBrunoContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const controllerBrunoPage = await controllerBrunoContext.newPage();
    const brunoRoomCode = await createRoomAsController(controllerBrunoPage, { name: 'Bruno', isPlaying: false });
    await addPlayer(controllerBrunoPage, 'Carlos');

    await controllerBrunoPage.screenshot({ path: path.join(EVIDENCES_DIR, '03-ca-03-controller-non-player-gray.png') });

    // Visualizador Daniel entra na sala de Bruno
    await viewerPage.goto(`/room/${brunoRoomCode}`);
    await viewerPage.getByPlaceholder('Seu Nome').fill('Daniel');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();

    const ghostBrunoViewer = viewerPage.locator('[data-testid="ghost-controller-row"]', { hasText: 'Bruno' });
    await expect(ghostBrunoViewer).toBeVisible();
    await expect(ghostBrunoViewer).toHaveClass(/opacity-50/);
    await viewerPage.screenshot({ path: path.join(EVIDENCES_DIR, '13-ca-13-viewer-sees-ghost-controller.png') });
    await viewerPage.screenshot({ path: path.join(EVIDENCES_DIR, '16-responsive-desktop-viewer.png') });

    await controllerContext.close();
    await viewerContext.close();
    await controllerBrunoContext.close();
  });

  test('Responsividade e acessibilidade', async ({ browser }) => {
    // Breakpoint Mobile (375x667)
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobilePage = await mobileContext.newPage();

    await createRoomAsController(mobilePage, { name: 'Mariana', isPlaying: true });
    await addPlayer(mobilePage, 'Lucas');

    await mobilePage.screenshot({ path: path.join(EVIDENCES_DIR, '14-responsive-mobile-controller.png') });

    await mobilePage.getByRole('button', { name: 'Abrir visão de jogador' }).click();
    const modal = mobilePage.getByRole('dialog');
    await expect(modal).toBeVisible();
    await mobilePage.screenshot({ path: path.join(EVIDENCES_DIR, '15-responsive-mobile-viewer-modal.png') });

    // Acessibilidade: Navegação por teclado (Escape)
    await mobilePage.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    await mobileContext.close();
  });
});
