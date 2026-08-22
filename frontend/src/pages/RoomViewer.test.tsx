import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoomViewer from './RoomViewer';

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  constructor(url: string) {
    this.url = url;
  }
  close() {}
}
global.EventSource = MockEventSource as unknown as typeof EventSource;

describe('RoomViewer', () => {
  it('joins room and displays players', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/join')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            room: {
              id: '1', code: 'ABCD', round: 1, players: [{ id: '1', name: 'Bob', score: 10, isLocal: false, positionDelta: 0 }]
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', code: 'ABCD', round: 1, players: [] })
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
