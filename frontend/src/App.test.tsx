import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import RoomController from './pages/RoomController';
import RoomViewer from './pages/RoomViewer';

describe('Frontend Tests', () => {
  it('App rendered properly', () => {
    render(<App />);
    expect(screen.getByText('Flip7 Score4All')).toBeDefined();
  });

  describe('Home Page', () => {
    it('creates a room and navigates', async () => {
      // Mock fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ code: 'ABCD' })
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      const createBtn = screen.getByText('Criar Nova Sala');
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('/api/rooms', { method: 'POST' });
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

  describe('RoomViewer', () => {
    it('joins room and displays players', async () => {
      globalThis.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/join')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              room: {
                id: '1', code: 'ABCD', players: [{ id: '1', name: 'Bob', score: 10, isLocal: false }]
              }
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1', code: 'ABCD', players: []
          })
        });
      });

      render(
        <MemoryRouter initialEntries={['/room/ABCD']}>
          <Routes>
            <Route path="/room/:code" element={<RoomViewer />} />
          </Routes>
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Seu Nome');
      fireEvent.change(input, { target: { value: 'Bob' } });
      
      const btn = screen.getByRole('button', { name: 'Entrar' });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(screen.getByText('10 pontos')).toBeDefined();
      });
    });
  });

  describe('RoomController', () => {
    it('fetches room data and adds local player', async () => {
      globalThis.fetch = vi.fn().mockImplementation((url, options) => {
        if (url === '/api/rooms/ABCD' && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: '1', code: 'ABCD', players: []
            })
          });
        }
        if (options && options.method === 'PUT') {
          return Promise.resolve({ ok: true });
        }
      });

      render(
        <MemoryRouter initialEntries={['/room/ABCD/controller']}>
          <Routes>
            <Route path="/room/:code/controller" element={<RoomController />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('SALA: ABCD')).toBeDefined();
      });

      const input = screen.getByPlaceholderText('Adicionar jogador presencial...');
      fireEvent.change(input, { target: { value: 'Alice' } });

      const addBtn = screen.getByText('Add');
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });
  });
});
