import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViewerPlayerRow from './ViewerPlayerRow';
import { Player } from '../types';

describe('ViewerPlayerRow', () => {
  const basePlayer: Player = {
    id: 'player-1',
    name: 'Alice',
    score: 25,
    isLocal: false,
    positionDelta: 0,
    status: 'playing',
    isDealer: false,
  };

  it('renders player name, score and status badge', () => {
    render(<ViewerPlayerRow player={basePlayer} index={0} isCurrentViewer={false} />);

    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('25 pontos')).toBeDefined();
    expect(screen.getByTestId('player-status-badge')).toBeDefined();
    expect(screen.getByText('Jogando')).toBeDefined();
    expect(screen.queryByTestId('dealer-badge')).toBeNull();
  });

  it('TU-18 — ViewerPlayerRow exibe badge de controlador', () => {
    const controllerPlayer: Player = { ...basePlayer, isController: true };
    render(<ViewerPlayerRow player={controllerPlayer} index={0} isCurrentViewer={false} />);

    expect(screen.getByTestId('controller-badge')).toBeDefined();
    expect(screen.getByLabelText('Controlador da sala')).toBeDefined();
  });

  it('TU-19 — ViewerPlayerRow renderiza controlador não-jogador em cinza', () => {
    const ghostController: Player = {
      id: 'p-ctrl',
      name: 'Mestre',
      score: 0,
      isLocal: true,
      positionDelta: 0,
      isController: true,
      status: undefined,
    };

    render(<ViewerPlayerRow player={ghostController} index={1} isCurrentViewer={false} />);

    const row = screen.getByTestId('ghost-controller-row');
    expect(row).toBeDefined();
    expect(row.className).toContain('opacity-50');
    expect(screen.queryByTestId('player-status-badge')).toBeNull();
  });

  it('displays dealer badge when player is dealer', () => {
    const dealerPlayer: Player = { ...basePlayer, isDealer: true };
    render(<ViewerPlayerRow player={dealerPlayer} index={1} isCurrentViewer={false} />);

    expect(screen.getByTestId('dealer-badge')).toBeDefined();
    expect(screen.getByText('Dealer')).toBeDefined();
  });

  it('displays custom status like Parou or Estourou', () => {
    const stoppedPlayer: Player = { ...basePlayer, status: 'stopped' };
    render(<ViewerPlayerRow player={stoppedPlayer} index={0} isCurrentViewer={true} />);

    expect(screen.getByText('Parou')).toBeDefined();
    expect(screen.getByText('Você')).toBeDefined();
  });
});
