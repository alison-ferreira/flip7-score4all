import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerStatusSelector from './PlayerStatusSelector';

describe('PlayerStatusSelector', () => {
  it('renders default playing status correctly', () => {
    const onSelectStatus = vi.fn();
    render(<PlayerStatusSelector status="playing" onSelectStatus={onSelectStatus} />);

    expect(screen.getByText('Jogando')).toBeDefined();
  });

  it('expands status options when clicked', () => {
    const onSelectStatus = vi.fn();
    render(<PlayerStatusSelector status="playing" onSelectStatus={onSelectStatus} />);

    const button = screen.getByRole('button', { name: /Status atual: Jogando/i });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'Parou' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Estourou' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Congelado' })).toBeDefined();
  });

  it('calls onSelectStatus and closes dropdown when an option is clicked', () => {
    const onSelectStatus = vi.fn();
    render(<PlayerStatusSelector status="playing" onSelectStatus={onSelectStatus} />);

    const button = screen.getByRole('button', { name: /Status atual: Jogando/i });
    fireEvent.click(button);

    const stoppedOption = screen.getByRole('button', { name: 'Parou' });
    fireEvent.click(stoppedOption);

    expect(onSelectStatus).toHaveBeenCalledWith('stopped');
  });
});
