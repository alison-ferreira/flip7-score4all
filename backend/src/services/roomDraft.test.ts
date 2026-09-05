import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db, Room } from './roomService';

describe('RoomService - PlayerRoundDraft', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('TU-01: deve criar um novo draft no jogador', () => {
    const room = RoomService.createRoom({ controllerName: 'Admin', isControllerPlaying: true }) as Room;
    const joinRes = RoomService.joinRoom(room.id, 'Ana');
    if ('error' in joinRes) throw new Error('Erro ao entrar na sala');
    const player = joinRes.player;

    const draft = {
      selectedNumbers: [2, 5],
      selectedBonus: [4],
      isMultiplierActive: true,
      total: 22
    };

    const result = RoomService.updatePlayerDraft(room.id, player.id, draft);
    if ('error' in result) throw new Error('Erro ao atualizar draft');

    const updatedPlayer = result.players.find(p => p.id === player.id);
    expect(updatedPlayer?.roundDraft).toEqual(draft);
  });

  it('TU-02: deve substituir um draft já existente de forma idempotente', () => {
    const room = RoomService.createRoom({ controllerName: 'Admin', isControllerPlaying: true }) as Room;
    const joinRes = RoomService.joinRoom(room.id, 'Ana');
    if ('error' in joinRes) throw new Error('Erro ao entrar na sala');
    const player = joinRes.player;

    const draft1 = {
      selectedNumbers: [2, 5],
      selectedBonus: [4],
      isMultiplierActive: true,
      total: 22
    };
    RoomService.updatePlayerDraft(room.id, player.id, draft1);

    const draft2 = {
      selectedNumbers: [7, 8],
      selectedBonus: [],
      isMultiplierActive: false,
      total: 15
    };
    const result = RoomService.updatePlayerDraft(room.id, player.id, draft2);
    if ('error' in result) throw new Error('Erro ao atualizar draft');

    const updatedPlayer = result.players.find(p => p.id === player.id);
    expect(updatedPlayer?.roundDraft).toEqual(draft2);
  });

  it('TU-03: deve consumir os drafts no finishRound e somar ao score consolidado', () => {
    const room = RoomService.createRoom({ controllerName: 'Admin', isControllerPlaying: true }) as Room;
    const p1Res = RoomService.joinRoom(room.id, 'P1');
    const p2Res = RoomService.joinRoom(room.id, 'P2');
    if ('error' in p1Res || 'error' in p2Res) throw new Error('Erro ao entrar na sala');

    const p1 = p1Res.player;
    const p2 = p2Res.player;
    p1.score = 10;
    p2.score = 20;

    RoomService.updatePlayerDraft(room.id, p1.id, {
      selectedNumbers: [10],
      selectedBonus: [],
      isMultiplierActive: false,
      total: 30
    });

    RoomService.updatePlayerDraft(room.id, p2.id, {
      selectedNumbers: [5],
      selectedBonus: [10],
      isMultiplierActive: false,
      total: 15
    });

    const result = RoomService.finishRound(room.id);
    if ('error' in result) throw new Error('Erro ao finalizar rodada');

    const updatedP1 = result.players.find(p => p.id === p1.id);
    const updatedP2 = result.players.find(p => p.id === p2.id);

    expect(updatedP1?.score).toBe(40);
    expect(updatedP2?.score).toBe(35);
    expect(updatedP1?.roundDraft).toBeUndefined();
    expect(updatedP2?.roundDraft).toBeUndefined();
  });
});
