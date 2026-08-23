import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DealerButton from './DealerButton';

describe('DealerButton', () => {
  it('renders correctly when not dealer', () => {
    const onSetDealer = vi.fn();
    render(<DealerButton isDealer={false} onSetDealer={onSetDealer} />);

    const btn = screen.getByRole('button', { name: 'Definir como Dealer' });
    expect(btn).toBeDefined();
  });

  it('renders correctly when dealer', () => {
    const onSetDealer = vi.fn();
    render(<DealerButton isDealer={true} onSetDealer={onSetDealer} />);

    const btn = screen.getByRole('button', { name: 'Dealer atual' });
    expect(btn).toBeDefined();
  });

  it('calls onSetDealer when clicked', () => {
    const onSetDealer = vi.fn();
    render(<DealerButton isDealer={false} onSetDealer={onSetDealer} />);

    fireEvent.click(screen.getByRole('button', { name: 'Definir como Dealer' }));
    expect(onSetDealer).toHaveBeenCalledTimes(1);
  });
});
