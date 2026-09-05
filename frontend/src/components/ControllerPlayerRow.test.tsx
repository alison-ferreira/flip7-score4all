import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControllerPlayerRow from './ControllerPlayerRow';
import { Player } from '../types';

describe('ControllerPlayerRow', () => {
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Alison',
    score: 10,
    isLocal: true,
    positionDelta: 0,
    status: 'playing',
    isDealer: false,
  };

  it('renders player info, dealer button and status selector', () => {
    const onOpenKeypad = vi.fn();
    const onRemove = vi.fn();
    const onUpdateStatus = vi.fn();
    const onSetDealer = vi.fn();

    render(
      <ControllerPlayerRow
        player={mockPlayer}
        index={0}
        onOpenKeypad={onOpenKeypad}
        onRemove={onRemove}
        onUpdateStatus={onUpdateStatus}
        onSetDealer={onSetDealer}
      />
    );

    expect(screen.getByText('Alison')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Definir como Dealer' })).toBeDefined();
    expect(screen.getByText('Jogando')).toBeDefined();
    expect(screen.getByText('10 pontos')).toBeDefined();
  });

  it('TU-16 — ControllerPlayerRow exibe badge Gamepad2 para controlador', () => {
    const controllerPlayer: Player = { ...mockPlayer, isController: true };
    render(
      <ControllerPlayerRow
        player={controllerPlayer}
        index={0}
        onOpenKeypad={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const badge = screen.getByTestId('controller-badge');
    expect(badge).toBeDefined();
    expect(screen.getByLabelText('Controlador da sala')).toBeDefined();
  });

  it('TU-17 — ControllerPlayerRow exibe "Você" para controlador-jogador', () => {
    render(
      <ControllerPlayerRow
        player={{ ...mockPlayer, isController: true }}
        index={0}
        isCurrentController={true}
        onOpenKeypad={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Você')).toBeDefined();
  });

  it('renders round draft badge when roundDraft is present', () => {
    const playerWithDraft: Player = {
      ...mockPlayer,
      roundDraft: {
        selectedNumbers: [10],
        selectedBonus: [],
        isMultiplierActive: false,
        total: 10,
      },
    };

    render(
      <ControllerPlayerRow
        player={playerWithDraft}
        index={0}
        onOpenKeypad={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByTestId('controller-round-draft-badge')).toBeDefined();
    expect(screen.getByText('+10 rodada')).toBeDefined();
    expect(screen.getByText('10 pontos')).toBeDefined();
  });

  it('triggers onUpdateStatus when status option is clicked', () => {
    const onUpdateStatus = vi.fn();

    render(
      <ControllerPlayerRow
        player={mockPlayer}
        index={0}
        onOpenKeypad={vi.fn()}
        onRemove={vi.fn()}
        onUpdateStatus={onUpdateStatus}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Status atual: Jogando/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Estourou' }));

    expect(onUpdateStatus).toHaveBeenCalledWith('p1', 'bust');
  });

  it('triggers onSetDealer when dealer button is clicked', () => {
    const onSetDealer = vi.fn();

    render(
      <ControllerPlayerRow
        player={mockPlayer}
        index={0}
        onOpenKeypad={vi.fn()}
        onRemove={vi.fn()}
        onSetDealer={onSetDealer}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Definir como Dealer' }));

    expect(onSetDealer).toHaveBeenCalledWith('p1');
  });
});
