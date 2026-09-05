import { test, expect } from '@playwright/test';
import { createRoomAsController } from './helpers/controllerHelpers';

test.describe('Edição de Pontuação da Rodada - E2E', () => {
  test('E2E-01: Persistência de edição na mesma rodada (Substituição e não acúmulo)', async ({ page }) => {
    // 1. Criar sala e adicionar jogador
    await createRoomAsController(page, { name: 'Admin', isPlaying: false });

    await page.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    const aliceRow = page.locator('.player-row', { hasText: 'Alice' });

    // 2. Abrir teclado de pontuação para Alice e registrar 30 pontos (10 + 12 + bonus +8)
    await aliceRow.getByRole('button', { name: '+ Rodada' }).click();
    await expect(page.getByText('Cartas de Número')).toBeVisible();

    await page.locator('.cards-grid').getByText('10', { exact: true }).click();
    await page.locator('.cards-grid').getByText('12', { exact: true }).click();
    await page.locator('.bonus-grid').getByText('+8', { exact: true }).click();

    // Valida que o display no modal exibe 30
    await expect(page.locator('.calc-res')).toHaveText('30');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Valida pontuação na UI do controlador: 0 pontos consolidados, badge "+30 rodada"
    await expect(aliceRow.getByText('0 pontos')).toBeVisible();
    await expect(aliceRow.getByTestId('controller-round-draft-badge')).toHaveText('+30 rodada');

    // 3. Reabrir a tela de pontuação para Alice
    await aliceRow.getByRole('button', { name: '+ Rodada' }).click();
    await expect(page.getByText('Cartas de Número')).toBeVisible();

    // Valida que as seleções anteriores estão mantidas no modal e o total exibe 30
    await expect(page.locator('.calc-res')).toHaveText('30');

    // 4. Alterar os campos para totalizar 45 pontos (adicionar carta 5 e bônus +10)
    await page.locator('.cards-grid').getByText('5', { exact: true }).click();
    await page.locator('.bonus-grid').getByText('+10', { exact: true }).click();

    // Total agora é 10 + 12 + 5 + 8 + 10 = 45
    await expect(page.locator('.calc-res')).toHaveText('45');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // 5. Validar que a pontuação pendente atualizada é +45 rodada (substituição, e NÃO soma 30 + 45 = 75)
    await expect(aliceRow.getByText('0 pontos')).toBeVisible();
    await expect(aliceRow.getByTestId('controller-round-draft-badge')).toHaveText('+45 rodada');
    await expect(aliceRow.getByText('75 pontos')).not.toBeVisible();
    await expect(aliceRow.getByText('+75 rodada')).not.toBeVisible();
  });

  test('E2E-02: Visualização da pontuação pendente (Controlador vs Espectador)', async ({ browser }) => {
    const controllerContext = await browser.newContext();
    const controllerPage = await controllerContext.newPage();

    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    // 1. Controlador cria a sala e adiciona Alice
    const roomCode = await createRoomAsController(controllerPage, { name: 'Admin', isPlaying: false });

    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await controllerPage.getByRole('button', { name: 'Add' }).click();

    // 2. Espectador (Bob) entra na sala
    await viewerPage.goto(`/room/${roomCode}`);
    await expect(viewerPage.getByText(`Entrar na Sala ${roomCode}`)).toBeVisible();
    await viewerPage.getByPlaceholder('Seu Nome').fill('Bob');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();

    await expect(viewerPage.getByText('Rodada 1')).toBeVisible();

    // 3. Controlador define rascunho de pontuação de 45 pontos para Alice
    const aliceRowController = controllerPage.locator('.player-row', { hasText: 'Alice' });
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await controllerPage.locator('.cards-grid').getByText('10', { exact: true }).click();
    await controllerPage.locator('.cards-grid').getByText('12', { exact: true }).click();
    await controllerPage.locator('.cards-grid').getByText('5', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+8', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+10', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // Valida no Controlador: 0 pontos consolidados e badge de rodada "+45 rodada"
    await expect(aliceRowController.getByText('0 pontos')).toBeVisible();
    await expect(aliceRowController.getByTestId('controller-round-draft-badge')).toHaveText('+45 rodada');

    // 4. Valida no Espectador: ranking consolidado exibe 0 pontos e badge de rodada mostra "+45 rodada"
    const aliceRowViewer = viewerPage.locator('.player-row', { hasText: 'Alice' });
    await expect(aliceRowViewer.getByText('0 pontos')).toBeVisible();
    await expect(aliceRowViewer.getByTestId('viewer-round-draft-badge')).toHaveText('+45 rodada');

    await controllerContext.close();
    await viewerContext.close();
  });

  test('E2E-03: Limpeza da rodada no encerramento (Consolidação ao finalizar rodada)', async ({ browser }) => {
    const controllerContext = await browser.newContext();
    const controllerPage = await controllerContext.newPage();

    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    // 1. Controlador cria a sala e adiciona Alice
    const roomCode = await createRoomAsController(controllerPage, { name: 'Admin', isPlaying: false });

    await controllerPage.getByPlaceholder('Adicionar jogador presencial...').fill('Alice');
    await controllerPage.getByRole('button', { name: 'Add' }).click();

    // 2. Espectador (Bob) entra na sala
    await viewerPage.goto(`/room/${roomCode}`);
    await expect(viewerPage.getByText(`Entrar na Sala ${roomCode}`)).toBeVisible();
    await viewerPage.getByPlaceholder('Seu Nome').fill('Bob');
    await viewerPage.getByRole('button', { name: 'Entrar' }).click();

    const aliceRowController = controllerPage.locator('.player-row', { hasText: 'Alice' });
    const bobRowController = controllerPage.locator('.player-row', { hasText: 'Bob' });

    // 3. Adicionar rascunho de pontuação para Alice (45 pts) e Bob (20 pts)
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await controllerPage.locator('.cards-grid').getByText('10', { exact: true }).click();
    await controllerPage.locator('.cards-grid').getByText('12', { exact: true }).click();
    await controllerPage.locator('.cards-grid').getByText('5', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+8', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+10', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    await bobRowController.getByRole('button', { name: '+ Rodada' }).click();
    await controllerPage.locator('.cards-grid').getByText('10', { exact: true }).click();
    await controllerPage.locator('.bonus-grid').getByText('+10', { exact: true }).click();
    await controllerPage.getByRole('button', { name: 'Confirmar' }).click();

    // Confirmar estado inicial antes de finalizar rodada
    const aliceRowViewer = viewerPage.locator('.player-row', { hasText: 'Alice' });
    const bobRowViewer = viewerPage.locator('.player-row', { hasText: 'Bob' });

    await expect(aliceRowController.getByTestId('controller-round-draft-badge')).toBeVisible();
    await expect(bobRowController.getByTestId('controller-round-draft-badge')).toBeVisible();
    await expect(aliceRowViewer.getByTestId('viewer-round-draft-badge')).toBeVisible();
    await expect(bobRowViewer.getByTestId('viewer-round-draft-badge')).toBeVisible();

    // 4. Controlador clica em "Finalizar Rodada"
    await controllerPage.getByRole('button', { name: 'Finalizar Rodada' }).click();

    // 5. Validar avanço para Rodada 2 no controlador e espectador
    await expect(controllerPage.getByText('Rodada 2')).toBeVisible();
    await expect(viewerPage.getByText('Rodada 2')).toBeVisible();

    // 6. Validar consolidação dos pontos
    await expect(aliceRowController.getByText('45 pontos')).toBeVisible();
    await expect(bobRowController.getByText('20 pontos')).toBeVisible();

    await expect(aliceRowViewer.getByText('45 pontos')).toBeVisible();
    await expect(bobRowViewer.getByText('20 pontos')).toBeVisible();

    // 7. Validar remoção dos rascunhos / indicação de pontos pendentes da rodada
    await expect(aliceRowController.getByTestId('controller-round-draft-badge')).not.toBeVisible();
    await expect(bobRowController.getByTestId('controller-round-draft-badge')).not.toBeVisible();

    await expect(aliceRowViewer.getByTestId('viewer-round-draft-badge')).not.toBeVisible();
    await expect(bobRowViewer.getByTestId('viewer-round-draft-badge')).not.toBeVisible();

    // 8. Reabrir modal na Rodada 2 para Alice e verificar rascunho zerado
    await aliceRowController.getByRole('button', { name: '+ Rodada' }).click();
    await expect(controllerPage.locator('.calc-res')).toHaveText('0');

    await controllerContext.close();
    await viewerContext.close();
  });
});
