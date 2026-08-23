import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControllerPlayerRow from './ControllerPlayerRow';
import { Player } from '../types';

describe('ControllerPlayerRow', () => {
  const mockPlayer: Player & { displayScore: number } = {
    id: 'p1',
    name: 'Alison',
    score: 10,
    displayScore: 10,
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
        roundScore={0}
        onOpenKeypad={onOpenKeypad}
        onRemove={onRemove}
        onUpdateStatus={onUpdateStatus}
        onSetDealer={onSetDealer}
      />
    );

    expect(screen.getByText('Alison')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Definir como Dealer' })).toBeDefined();
    expect(screen.getByText('Jogando')).toBeDefined();
  });

  it('triggers onUpdateStatus when status option is clicked', () => {
    const onOpenKeypad = vi.fn();
    const onRemove = vi.fn();
    const onUpdateStatus = vi.fn();
    const onSetDealer = vi.fn();

    render(
      <ControllerPlayerRow
        player={mockPlayer}
        index={0}
        roundScore={0}
        onOpenKeypad={onOpenKeypad}
        onRemove={onRemove}
        onUpdateStatus={onUpdateStatus}
        onSetDealer={onSetDealer}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Status atual: Jogando/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Estourou' }));

    expect(onUpdateStatus).toHaveBeenCalledWith('p1', 'bust');
  });

  it('triggers onSetDealer when dealer button is clicked', () => {
    const onOpenKeypad = vi.fn();
    const onRemove = vi.fn();
    const onUpdateStatus = vi.fn();
    const onSetDealer = vi.fn();

    render(
      <ControllerPlayerRow
        player={mockPlayer}
        index={0}
        roundScore={0}
        onOpenKeypad={onOpenKeypad}
        onRemove={onRemove}
        onUpdateStatus={onUpdateStatus}
        onSetDealer={onSetDealer}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Definir como Dealer' }));

    expect(onSetDealer).toHaveBeenCalledWith('p1');
  });
});
