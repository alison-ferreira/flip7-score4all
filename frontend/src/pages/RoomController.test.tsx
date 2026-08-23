import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoomController from './RoomController';

let mockEventSourceInstance: MockEventSource | null = null;

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  constructor(url: string) {
    this.url = url;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockEventSourceInstance = this;
  }
  close() {}
}
global.EventSource = MockEventSource as unknown as typeof EventSource;

describe('RoomController', () => {
  it('fetches room data and adds local player', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      if (url === '/api/rooms/ABCD' && !options) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '1', code: 'ABCD', round: 1, players: [] })
        });
      }
      if (options && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '1', code: 'ABCD', round: 1, players: [{ id: '123', name: 'Alice', score: 0, isLocal: true, positionDelta: 0, status: 'playing', isDealer: false }] })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <MemoryRouter initialEntries={['/room/ABCD/controller']}>
        <Routes>
          <Route path="/room/:code/controller" element={<RoomController />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    act(() => {
      mockEventSourceInstance?.onmessage?.({ data: JSON.stringify({ id: '1', code: 'ABCD', round: 1, players: [] }) } as MessageEvent);
    });

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

  it('updates player status and sets dealer', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      if (url === '/api/rooms/ABCD' && !options) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            code: 'ABCD',
            round: 1,
            players: [{ id: '123', name: 'Alice', score: 0, isLocal: true, positionDelta: 0, status: 'playing', isDealer: false }]
          })
        });
      }
      if (url === '/api/rooms/1/player/123/status' && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            code: 'ABCD',
            round: 1,
            players: [{ id: '123', name: 'Alice', score: 0, isLocal: true, positionDelta: 0, status: 'stopped', isDealer: false }]
          })
        });
      }
      if (url === '/api/rooms/1/dealer/123' && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            code: 'ABCD',
            round: 1,
            players: [{ id: '123', name: 'Alice', score: 0, isLocal: true, positionDelta: 0, status: 'stopped', isDealer: true }]
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <MemoryRouter initialEntries={['/room/ABCD/controller']}>
        <Routes>
          <Route path="/room/:code/controller" element={<RoomController />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    act(() => {
      mockEventSourceInstance?.onmessage?.({
        data: JSON.stringify({
          id: '1',
          code: 'ABCD',
          round: 1,
          players: [{ id: '123', name: 'Alice', score: 0, isLocal: true, positionDelta: 0, status: 'playing', isDealer: false }]
        })
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeDefined();
    });

    // Change status
    fireEvent.click(screen.getByRole('button', { name: /Status atual: Jogando/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Parou' }));

    await waitFor(() => {
      expect(screen.getByText('Parou')).toBeDefined();
    });

    // Set dealer
    fireEvent.click(screen.getByRole('button', { name: 'Definir como Dealer' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Dealer atual' })).toBeDefined();
    });
  });
});
