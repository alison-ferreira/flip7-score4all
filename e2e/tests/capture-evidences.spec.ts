import { test, expect } from '@playwright/test';
import path from 'path';

const EVIDENCES_DIR = path.resolve(__dirname, '../../tasks/prd-controle-rodadas/evidences');
test.describe('Captura de Evidências Visuais - Controle de Rodadas', () => {
  test('Fluxo completo e geração de screenshots', async ({ browser }) => {
    // 1. Home Screen
    const homeContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const homePage = await homeContext.newPage();
    await homePage.goto('/');
    await expect(homePage.getByText('Flip7 Score4All')).toBeVisible();
    await homePage.screenshot({ path: path.join(EVIDENCES_DIR, '01-home-screen.png') });

    // 2. Controlador cria sala
    await homePage.getByRole('button', { name: 'Criar Nova Sala' }).click();
    await expect(homePage.getByText(/SALA:/)).toBeVisible();
    await expect(homePage.getByText('Rodada 1')).toBeVisible();

    const roomCodeElement = homePage.locator('.room-code');
    const roomCodeText = await roomCodeElement.innerText();
    const roomCode = roomCodeText.replace('SALA:', '').trim();

    // Adiciona jogadores Alice e Bob
    await homePage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await homePage.getByRole('button', { name: 'Add' }).click();
    await expect(homePage.getByText('Alice')).toBeVisible();

    await homePage.getByPlaceholder('Adicionar jogador presencial...').fill('Bob');
    await homePage.getByRole('button', { name: 'Add' }).click();
    await expect(homePage.getByText('Bob')).toBeVisible();

    // 3. Contexto do Participante entra na sala
    const participantContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const participantPage = await participantContext.newPage();
    await participantPage.goto(`/room/${roomCode}`);
    await expect(participantPage.getByText(`Entrar na Sala ${roomCode}`)).toBeVisible();

    await participantPage.getByPlaceholder('Seu Nome').fill('Carlos');
    await participantPage.getByRole('button', { name: 'Entrar' }).click();

    await expect(participantPage.getByText('Rodada 1')).toBeVisible();
    await expect(participantPage.getByText('Alice')).toBeVisible();
    await expect(participantPage.getByText('Bob')).toBeVisible();

    // 4. Controlador insere pontuação parcial para Bob
    const bobRowController = homePage.locator('.player-row', { hasText: 'Bob' });
    await bobRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(homePage.getByText('Cartas de Número')).toBeVisible();
    await homePage.getByText('10', { exact: true }).click();
    await homePage.getByRole('button', { name: 'Confirmar' }).click();

    await expect(bobRowController.getByText('+10 rodada')).toBeVisible();
    await homePage.screenshot({ path: path.join(EVIDENCES_DIR, '02-controller-round-1-partials.png') });

    // 5. Validar que visão do participante continua em 0 pontos (CA-02)
    const bobRowParticipant = participantPage.locator('.player-row', { hasText: 'Bob' });
    await expect(bobRowParticipant.getByText('0 pontos')).toBeVisible();
    await expect(participantPage.getByText('Rodada 1')).toBeVisible();
    await participantPage.screenshot({ path: path.join(EVIDENCES_DIR, '03-participant-round-1-hidden.png') });

    // 6. Controlador clica em "Finalizar Rodada" (CA-03, CA-04, CA-05)
    await homePage.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(homePage.getByText('Rodada 2')).toBeVisible();
    await expect(participantPage.getByText('Rodada 2')).toBeVisible();
    await expect(bobRowParticipant.getByText('10 pontos')).toBeVisible();

    // Validar indicadores de variação (Bob subiu 1, Alice caiu 1)
    await expect(bobRowParticipant.locator('[aria-label="Subiu 1 posições no ranking"]')).toBeVisible();
    const aliceRowParticipant = participantPage.locator('.player-row', { hasText: 'Alice' });
    await expect(aliceRowParticipant.locator('[aria-label="Caiu 1 posições no ranking"]')).toBeVisible();

    await participantPage.screenshot({ path: path.join(EVIDENCES_DIR, '04-participant-round-2-deltas.png') });

    // 7. Rodada 2: Adiciona pontos para ambos mantendo posições (CA-06)
    await bobRowController.getByRole('button', { name: '+ Rodada' }).click();
    await homePage.getByText('5', { exact: true }).click();
    await homePage.getByRole('button', { name: 'Confirmar' }).click();

    const aliceRowController = homePage.locator('.player-row', { hasText: 'Alice' });
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await homePage.getByText('5', { exact: true }).click();
    await homePage.getByRole('button', { name: 'Confirmar' }).click();

    await homePage.getByRole('button', { name: 'Finalizar Rodada' }).click();
    await expect(homePage.getByText('Rodada 3')).toBeVisible();
    await expect(participantPage.getByText('Rodada 3')).toBeVisible();

    await expect(bobRowParticipant.getByText('15 pontos')).toBeVisible();
    await expect(aliceRowParticipant.getByText('5 pontos')).toBeVisible();

    await expect(bobRowParticipant.locator('[aria-label="Manteve posição"]')).toBeVisible();
    await expect(aliceRowParticipant.locator('[aria-label="Manteve posição"]')).toBeVisible();

    await participantPage.screenshot({ path: path.join(EVIDENCES_DIR, '05-participant-round-3-maintenance.png') });

    await homeContext.close();
    await participantContext.close();
  });
});
