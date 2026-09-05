import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db, Room, Player } from './roomService';
import { sortPlayers } from './roomUtils';

describe('RoomService - Controller & Lifecycle (TU-01 a TU-09)', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('TU-01: createRoom com controlador jogando cria sala com jogador-controlador', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    expect(room.controllerName).toBe('Ana');
    expect(room.isControllerPlaying).toBe(true);
    expect(room.controllerPlayerId).toBeDefined();
    expect(room.players).toHaveLength(1);
    expect(room.players[0].id).toBe(room.controllerPlayerId);
    expect(room.players[0].isController).toBe(true);
    expect(room.players[0].status).toBe('playing');
  });

  it('TU-02: createRoom com controlador não-jogando cria sala com jogador fantasma', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: false }) as Room;
    expect(room.controllerName).toBe('Ana');
    expect(room.isControllerPlaying).toBe(false);
    expect(room.controllerPlayerId).toBeNull();
    expect(room.players).toHaveLength(1);
    expect(room.players[0].isController).toBe(true);
    expect(room.players[0].status).toBeUndefined();
    expect(room.players[0].isDealer).toBeUndefined();
  });

  it('TU-03: createRoom sem nome retorna erro', () => {
    const empty = RoomService.createRoom({ controllerName: '   ', isControllerPlaying: true });
    expect(empty).toEqual({ error: 'Nome do controlador é obrigatório' });
    const missing = RoomService.createRoom();
    expect(missing).toEqual({ error: 'Nome do controlador é obrigatório' });
  });

  it('TU-04: resetGame preserva jogadores e zera pontuação', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const joinRes = RoomService.joinRoom(room.id, 'Carlos') as { room: Room; player: Player };
    joinRes.player.score = 50;
    room.players[0].score = 30;
    room.round = 3;
    const reset = RoomService.resetGame(room.id, true) as Room;
    expect(reset.round).toBe(1);
    expect(reset.players).toHaveLength(2);
    expect(reset.players.every(p => p.score === 0 && p.positionDelta === 0 && p.status === 'playing')).toBe(true);
  });

  it('TU-05: resetGame muda controlador para jogador', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: false }) as Room;
    const reset = RoomService.resetGame(room.id, true) as Room;
    expect(reset.isControllerPlaying).toBe(true);
    expect(reset.controllerPlayerId).toBeDefined();
    expect(reset.players.find(p => p.isController)?.status).toBe('playing');
  });

  it('TU-06: resetGame muda controlador para não-jogador', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const reset = RoomService.resetGame(room.id, false) as Room;
    expect(reset.isControllerPlaying).toBe(false);
    expect(reset.controllerPlayerId).toBeNull();
    expect(reset.players.find(p => p.isController)?.status).toBeUndefined();
  });

  it('TU-07: updateRoomPlayers detecta remoção do controlador e cria fantasma', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const other: Player = { id: 'p2', name: 'Beto', score: 10, isLocal: true, positionDelta: 0, status: 'playing' };
    const updated = RoomService.updateRoomPlayers(room.id, [other]);
    expect(updated?.isControllerPlaying).toBe(false);
    expect(updated?.controllerPlayerId).toBeNull();
    expect(updated?.players).toHaveLength(2);
    expect(updated?.players[1].isController).toBe(true);
    expect(updated?.players[1].status).toBeUndefined();
  });

  it('TU-08: rankeia jogadores com controlador não-jogador por último', () => {
    const p1: Player = { id: '1', name: 'A', score: 20, isLocal: true, positionDelta: 0, status: 'playing' };
    const ghost: Player = { id: '2', name: 'Ana', score: 0, isLocal: true, positionDelta: 0, isController: true };
    const p2: Player = { id: '3', name: 'B', score: 50, isLocal: true, positionDelta: 0, status: 'playing' };
    const sorted = sortPlayers([p1, ghost, p2]);
    expect(sorted.map(p => p.id)).toEqual(['3', '1', '2']);
  });

  it('TU-09: joinRoom rejeita nome duplicado com controllerName', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const res = RoomService.joinRoom(room.id, 'Ana');
    if ('error' in res) throw new Error('Erro ao juntar');
    expect(res.isNew).toBe(false);
    expect(res.player.id).toBe(room.controllerPlayerId);
  });
});
