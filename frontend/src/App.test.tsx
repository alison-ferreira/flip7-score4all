import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';

describe('Frontend Tests', () => {
  it('App rendered properly', () => {
    render(<App />);
    expect(screen.getByText('Flip7 Score4All')).toBeDefined();
  });

  describe('Home Page', () => {
    it('creates a room with controller setup and navigates', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ code: 'ABCD' })
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const createBtn = screen.getByText('Criar Nova Sala');
      fireEvent.click(createBtn);

      const nameInput = screen.getByLabelText(/seu nome/i);
      fireEvent.change(nameInput, { target: { value: 'Lucas' } });

      const enterBtn = screen.getByRole('button', { name: /confirmar configuração do controlador/i });
      fireEvent.click(enterBtn);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ controllerName: 'Lucas', isControllerPlaying: true })
        });
      });
    });

    it('joins a room', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Ex: A4B2');
      fireEvent.change(input, { target: { value: 'ABCD' } });

      const joinBtn = screen.getByText('Entrar');
      fireEvent.click(joinBtn);

      expect((input as HTMLInputElement).value).toBe('ABCD');
    });
  });
});
