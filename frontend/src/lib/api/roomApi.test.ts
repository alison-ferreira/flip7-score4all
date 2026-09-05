import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePlayerStatus, setDealer } from './roomApi';
import { Room } from '../../types';

describe('roomApi - Player status e dealer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve chamar a API de atualizar status do jogador com os parâmetros corretos', async () => {
    const mockRoom: Room = {
      id: 'room-1',
      code: 'ABCD',
      createdAt: 123456789,
      round: 1,
      players: [
        { id: 'player-1', name: 'Alice', score: 10, isLocal: false, positionDelta: 0, status: 'stopped', isDealer: false }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoom
    } as Response);

    const result = await updatePlayerStatus('room-1', 'player-1', 'stopped');

    expect(fetchSpy).toHaveBeenCalledWith('/api/rooms/room-1/player/player-1/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'stopped' })
    });
    expect(result).toEqual(mockRoom);
  });

  it('deve lançar erro quando a API de atualizar status falhar', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false
    } as Response);

    await expect(updatePlayerStatus('room-1', 'player-1', 'stopped')).rejects.toThrow('Erro ao atualizar status do jogador');
  });

  it('deve chamar a API de definir dealer com os parâmetros corretos', async () => {
    const mockRoom: Room = {
      id: 'room-1',
      code: 'ABCD',
      createdAt: 123456789,
      round: 1,
      players: [
        { id: 'player-1', name: 'Alice', score: 10, isLocal: false, positionDelta: 0, status: 'playing', isDealer: true }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoom
    } as Response);

    const result = await setDealer('room-1', 'player-1');

    expect(fetchSpy).toHaveBeenCalledWith('/api/rooms/room-1/dealer/player-1', {
      method: 'PUT'
    });
    expect(result).toEqual(mockRoom);
  });

  it('deve lançar erro quando a API de definir dealer falhar', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false
    } as Response);

    await expect(setDealer('room-1', 'player-1')).rejects.toThrow('Erro ao definir dealer');
  });
});

describe('roomApi - createRoom e resetGame', () => {
  it('deve chamar createRoom com payload correto', async () => {
    const mockRoom: Room = {
      id: 'room-1',
      code: 'ABCD',
      createdAt: 123456789,
      round: 1,
      players: [],
      controllerName: 'Ana',
      isControllerPlaying: true,
      controllerPlayerId: 'p1',
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoom,
    } as Response);

    const result = await (await import('./roomApi')).createRoom({
      controllerName: 'Ana',
      isControllerPlaying: true,
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ controllerName: 'Ana', isControllerPlaying: true }),
    });
    expect(result).toEqual(mockRoom);
  });

  it('deve chamar resetGame com payload correto', async () => {
    const mockRoom: Room = {
      id: 'room-1',
      code: 'ABCD',
      createdAt: 123456789,
      round: 1,
      players: [],
      isControllerPlaying: false,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoom,
    } as Response);

    const result = await (await import('./roomApi')).resetGame('room-1', {
      isControllerPlaying: false,
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/rooms/room-1/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isControllerPlaying: false }),
    });
    expect(result).toEqual(mockRoom);
  });
});
