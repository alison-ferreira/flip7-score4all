import { test, expect } from '@playwright/test';

test.describe('E2E-02: UI do Visualizador Logado (Status Banner, Status Badges e Dealer)', () => {
  test('Exibe status do próprio jogador no cabeçalho e atualizações de status/dealer na lista em tempo real', async ({ browser }) => {
    // 1. Contexto do Controlador
    const controllerContext = await browser.newContext();
    const controllerPage = await controllerContext.newPage();

    await controllerPage.goto('/');
    await controllerPage.getByRole('button', { name: 'Criar Nova Sala' }).click();
    await expect(controllerPage.getByText(/SALA:/)).toBeVisible();

    const roomCodeText = await controllerPage.locator('.room-code').innerText();
    const roomCode = roomCodeText.replace('SALA:', '').trim();

    // Adicionar jogadores no controlador: Bob e Alice
    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Bob');
    await controllerPage.getByRole('button', { name: 'Add' }).click();
    await expect(controllerPage.getByText('Bob')).toBeVisible();

    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await controllerPage.getByRole('button', { name: 'Add' }).click();
    await expect(controllerPage.getByText('Alice')).toBeVisible();

    // 2. Contexto do Visualizador (Bob)
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    await viewerPage.goto(`/room/${roomCode}`);
    await viewerPage.getByPlaceholder('Seu Nome').fill('Bob');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();

    // Verificar tela do visualizador (inicial)
    await expect(viewerPage.getByTestId('local-player-status-banner')).toBeVisible();
    await expect(viewerPage.getByTestId('local-player-status-banner')).toContainText('Jogando');

    const bobViewerRow = viewerPage.locator('.player-row', { hasText: 'Bob' });
    const aliceViewerRow = viewerPage.locator('.player-row', { hasText: 'Alice' });

    await expect(bobViewerRow.getByTestId('player-status-badge')).toContainText('Jogando');
    await expect(aliceViewerRow.getByTestId('player-status-badge')).toContainText('Jogando');

    // 3. Controlador altera status de Bob para "Estourou"
    const bobControllerRow = controllerPage.locator('.player-row', { hasText: 'Bob' });
    await bobControllerRow.getByRole('button', { name: /Status atual: Jogando/i }).click();
    await bobControllerRow.getByRole('button', { name: 'Estourou' }).click();
    await expect(bobControllerRow.getByRole('button', { name: /Status atual: Estourou/i })).toBeVisible();

    // 4. Controlador define Alice como Dealer
    const aliceControllerRow = controllerPage.locator('.player-row', { hasText: 'Alice' });
    await aliceControllerRow.getByRole('button', { name: 'Definir como Dealer' }).click();
    await expect(aliceControllerRow.getByRole('button', { name: 'Dealer atual' })).toBeVisible();

    // 5. Visualizador reflete as mudanças em tempo real
    await expect(viewerPage.getByTestId('local-player-status-banner')).toContainText('Estourou');
    await expect(bobViewerRow.getByTestId('player-status-badge')).toContainText('Estourou');
    await expect(aliceViewerRow.getByTestId('dealer-badge')).toBeVisible();

    await controllerContext.close();
    await viewerContext.close();
  });
});
