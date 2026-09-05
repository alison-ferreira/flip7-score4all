import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ControllerSetup from './ControllerSetup';

describe('ControllerSetup', () => {
  it('TU-10 — ControllerSetup valida nome não-vazio', () => {
    const handleSubmit = vi.fn();
    render(<ControllerSetup onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /confirmar configuração do controlador/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);

    const input = screen.getByLabelText(/seu nome/i);
    fireEvent.change(input, { target: { value: '   ' } });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(input, { target: { value: 'Lucas' } });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('TU-11 — ControllerSetup envia nome e participação', () => {
    const handleSubmit = vi.fn();
    render(<ControllerSetup onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/seu nome/i);
    fireEvent.change(input, { target: { value: '  Beatriz  ' } });

    const toggle = screen.getByLabelText(/participar como jogador/i) as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    const submitBtn = screen.getByRole('button', { name: /confirmar configuração do controlador/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('Beatriz', true);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);

    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(2);
    expect(handleSubmit).toHaveBeenLastCalledWith('Beatriz', false);
  });
});
