import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResetGameModal from './ResetGameModal';

describe('ResetGameModal', () => {
  it('TU-15 — ResetGameModal exibe toggle de participação', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const { rerender } = render(
      <ResetGameModal
        isOpen={false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.queryByText(/reiniciar partida/i)).toBeNull();

    rerender(
      <ResetGameModal
        isOpen={true}
        initialIsPlaying={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const toggle = screen.getByLabelText(/participar como jogador/i) as HTMLInputElement;
    expect(toggle).toBeDefined();
    expect(toggle.checked).toBe(true);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith(false);

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
