import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db } from './roomService';

describe('RoomService - Finish Round', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('deve retornar erro se a sala não existir', () => {
    const result = RoomService.finishRound('invalid', {});
    expect(result).toEqual({ error: 'Sala não encontrada' });
  });

  it('TU-01: deve incrementar o número da rodada', () => {
    const room = RoomService.createRoom();
    const initialRound = room.round;
    const result = RoomService.finishRound(room.id, {}) as typeof room;
    expect(result.round).toBe(initialRound + 1);
  });

  it('TU-02: deve calcular subida de posição (positionDelta > 0)', () => {
    const room = RoomService.createRoom();
    RoomService.joinRoom(room.id, 'P1');
    RoomService.joinRoom(room.id, 'P2');
    RoomService.joinRoom(room.id, 'P3');

    const p1 = room.players.find((p) => p.name === 'P1')!;
    const p2 = room.players.find((p) => p.name === 'P2')!;
    const p3 = room.players.find((p) => p.name === 'P3')!;
    p1.score = 30;
    p2.score = 20;
    p3.score = 10;

    RoomService.finishRound(room.id, { [p3.id]: 100 });
    expect(p3.positionDelta).toBe(2);
  });

  it('TU-03: deve calcular descida de posição (positionDelta < 0)', () => {
    const room = RoomService.createRoom();
    RoomService.joinRoom(room.id, 'P1');
    RoomService.joinRoom(room.id, 'P2');

    const p1 = room.players.find((p) => p.name === 'P1')!;
    const p2 = room.players.find((p) => p.name === 'P2')!;
    p1.score = 50;
    p2.score = 10;

    RoomService.finishRound(room.id, { [p2.id]: 100 });
    expect(p1.positionDelta).toBe(-1);
  });

  it('TU-04: deve calcular manutenção de posição (positionDelta === 0)', () => {
    const room = RoomService.createRoom();
    RoomService.joinRoom(room.id, 'P1');
    RoomService.joinRoom(room.id, 'P2');

    const p1 = room.players.find((p) => p.name === 'P1')!;
    const p2 = room.players.find((p) => p.name === 'P2')!;
    p1.score = 50;
    p2.score = 10;

    RoomService.finishRound(room.id, { [p1.id]: 10, [p2.id]: 10 });
    expect(p1.positionDelta).toBe(0);
    expect(p2.positionDelta).toBe(0);
  });

  it('TU-03: deve resetar o status de todos os jogadores para playing no fim da rodada', () => {
    const room = RoomService.createRoom();
    RoomService.joinRoom(room.id, 'P1');
    RoomService.joinRoom(room.id, 'P2');

    const p1 = room.players.find((p) => p.name === 'P1')!;
    const p2 = room.players.find((p) => p.name === 'P2')!;

    RoomService.updatePlayerStatus(room.id, p1.id, 'stopped');
    RoomService.updatePlayerStatus(room.id, p2.id, 'bust');

    expect(p1.status).toBe('stopped');
    expect(p2.status).toBe('bust');

    RoomService.finishRound(room.id, {});

    expect(p1.status).toBe('playing');
    expect(p2.status).toBe('playing');
  });
});
