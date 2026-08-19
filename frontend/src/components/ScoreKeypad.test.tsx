import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoreKeypad from './ScoreKeypad';
import { Player } from '../types';

describe('ScoreKeypad', () => {
  const mockPlayer: Player = { id: '1', name: 'Alice', score: 0, isLocal: false };

  it('renders correctly', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Cancelar')).toBeDefined();
  });

  it('selects numbers and calculates sum', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    // Toggle number 5
    fireEvent.click(screen.getByText('5'));
    // Toggle number 10
    fireEvent.click(screen.getByText('10'));

    // Should display sum 15
    expect(screen.getByText('15')).toBeDefined();
    expect(screen.getByText('5+10')).toBeDefined();
  });

  it('toggles multiplier', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('2x'));

    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // 5 * 2 and card 10
    expect(screen.getByText('(5)x2')).toBeDefined();
  });

  it('selects bonuses', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('+10'));
    
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('calls onConfirm with correct total', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+10'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledWith(15);
  });

  it('calls onCancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ScoreKeypad player={mockPlayer} onConfirm={onConfirm} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});
