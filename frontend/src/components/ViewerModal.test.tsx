import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ViewerModal from './ViewerModal';
import { Room } from '../types';

describe('ViewerModal', () => {
  const mockRoom: Room = {
    id: 'room-1',
    code: 'F7X2',
    createdAt: Date.now(),
    round: 2,
    controllerName: 'Ana',
    controllerPlayerId: 'p1',
    isControllerPlaying: true,
    players: [
      { id: 'p1', name: 'Ana', score: 35, isLocal: true, positionDelta: 1, status: 'playing', isDealer: false, isController: true },
      { id: 'p2', name: 'Carlos', score: 20, isLocal: false, positionDelta: -1, status: 'stopped', isDealer: true },
    ],
  };

  it('TU-12 — ViewerModal renderiza ranking limpo', () => {
    render(<ViewerModal isOpen={true} room={mockRoom} onClose={vi.fn()} />);

    expect(screen.getByText(/visão do jogador/i)).toBeDefined();
    expect(screen.getByText('Ana')).toBeDefined();
    expect(screen.getByText('Carlos')).toBeDefined();
    expect(screen.queryByRole('button', { name: /\+ rodada/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /✕/i })).toBeNull();
    expect(screen.getByText(/seu status: jogando/i)).toBeDefined();
  });

  it('TU-13 — ViewerModal fecha ao clicar botão de fechar', () => {
    const handleClose = vi.fn();
    render(<ViewerModal isOpen={true} room={mockRoom} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /fechar visão de jogador/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('TU-14 — ViewerModal fecha ao pressionar Escape', () => {
    const handleClose = vi.fn();
    render(<ViewerModal isOpen={true} room={mockRoom} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
