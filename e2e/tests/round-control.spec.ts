import { test, expect } from '@playwright/test';

test.describe('Controle de Rodadas - E2E', () => {
  test('E2E-01: Fluxo completo do Controlador e Participante com ocultação de parciais e revelação por rodada', async ({ browser }) => {
    // Contexto 1: Controlador
    const controllerContext = await browser.newContext();
    const controllerPage = await controllerContext.newPage();

    // Contexto 2: Participante
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();

    // 1. Controlador cria a sala
    await controllerPage.goto('/');
    await controllerPage.getByRole('button', { name: 'Criar Nova Sala' }).click();
    await expect(controllerPage.getByText(/SALA:/)).toBeVisible();
    await expect(controllerPage.getByText('Rodada 1')).toBeVisible();

    // Extrai o código da sala
    const roomCodeElement = controllerPage.locator('.room-code');
    const roomCodeText = await roomCodeElement.innerText();
    const roomCode = roomCodeText.replace('SALA:', '').trim();

    // Controlador adiciona jogador presencial "Alice"
    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await controllerPage.getByRole('button', { name: 'Add' }).click();
    await expect(controllerPage.getByText('Alice')).toBeVisible();

    // 2. Participante entra na sala em outro contexto/aba (Subtarefa 7.2)
    await participantPage.goto(`/room/${roomCode}`);
    await expect(participantPage.getByText(`Entrar na Sala ${roomCode}`)).toBeVisible();

    await participantPage.getByPlaceholder('Seu Nome').fill('Bob');
    await participantPage.getByRole('button', { name: 'Entrar' }).click();

    // Participante visualiza a sala na Rodada 1 com Alice e Bob
    await expect(participantPage.getByText('Rodada 1')).toBeVisible();
    await expect(participantPage.getByText('Alice')).toBeVisible();
    await expect(participantPage.getByText('Bob')).toBeVisible();

    // 3. Controlador insere pontuação parcial para Bob
    const bobRowController = controllerPage.locator('.player-row', { hasText: 'Bob' });
    await bobRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.getByText('Cartas de Número')).toBeVisible();

    // Seleciona a carta 10 e confirma no keypad
    await controllerPage.getByText('10', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // No controlador, exibe pontuação consolidada (0 pontos) e o badge da rodada em andamento (+10 rodada)
    await expect(bobRowController.getByText('0 pontos')).toBeVisible();
    await expect(bobRowController.getByText('+10 rodada')).toBeVisible();

    // 4. Validar que na visão do participante a pontuação de Bob NÃO mudou (Subtarefa 7.3 / CA-02)
    const bobRowParticipant = participantPage.locator('.player-row', { hasText: 'Bob' });
    await expect(bobRowParticipant.getByText('0 pontos')).toBeVisible();
    await expect(participantPage.getByText('Rodada 1')).toBeVisible();

    // 5. Controlador clica em "Finalizar Rodada" (Subtarefa 7.4 / CA-03)
    await controllerPage.getByRole('button', { name: 'Finalizar Rodada' }).click();

    // No controlador, avança para Rodada 2 e atualiza os pontos
    await expect(controllerPage.getByText('Rodada 2')).toBeVisible();
    await expect(bobRowController.getByText('10 pontos')).toBeVisible();

    // No participante, atualiza instantaneamente via SSE para Rodada 2 com 10 pontos
    await expect(participantPage.getByText('Rodada 2')).toBeVisible();
    await expect(bobRowParticipant.getByText('10 pontos')).toBeVisible();

    // Validar indicadores de evolução de posição (Bob subiu 1 posição: CA-04, Alice caiu 1 posição: CA-05)
    await expect(bobRowParticipant.locator('[aria-label="Subiu 1 posições no ranking"]')).toBeVisible();

    const aliceRowParticipant = participantPage.locator('.player-row', { hasText: 'Alice' });
    await expect(aliceRowParticipant.locator('[aria-label="Caiu 1 posições no ranking"]')).toBeVisible();

    // 6. Rodada 2: Adiciona pontos para ambos mantendo posições (CA-06)
    // Adiciona +5 para Bob
    await bobRowController.getByRole('button', { name: '+ Rodada' }).click();
    await controllerPage.getByText('5', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // Adiciona +5 para Alice
    const aliceRowController = controllerPage.locator('.player-row', { hasText: 'Alice' });
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await controllerPage.getByText('5', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // Finalizar Rodada 2 -> avança para Rodada 3
    await controllerPage.getByRole('button', { name: 'Finalizar Rodada' }).click();

    await expect(controllerPage.getByText('Rodada 3')).toBeVisible();
    await expect(participantPage.getByText('Rodada 3')).toBeVisible();

    // Bob tem 15 pontos, Alice tem 5 pontos
    await expect(bobRowParticipant.getByText('15 pontos')).toBeVisible();
    await expect(aliceRowParticipant.getByText('5 pontos')).toBeVisible();

    // Ambos mantiveram posições (CA-06) -> aria-label="Manteve posição"
    await expect(bobRowParticipant.locator('[aria-label="Manteve posição"]')).toBeVisible();
    await expect(aliceRowParticipant.locator('[aria-label="Manteve posição"]')).toBeVisible();

    await controllerContext.close();
    await participantContext.close();
  });
});
