import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db } from './roomService';

describe('RoomService', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  describe('createRoom', () => {
    it('deve criar uma nova sala com a rodada igual a 1', () => {
      const room = RoomService.createRoom();
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('code');
      expect(room.code.length).toBe(4);
      expect(room.players).toEqual([]);
      expect(room.round).toBe(1);
      expect(db[room.id]).toBeDefined();
    });
  });

  describe('getRoomByIdOrCode', () => {
    it('deve retornar sala pelo ID e pelo código', () => {
      const room = RoomService.createRoom();
      expect(RoomService.getRoomByIdOrCode(room.id)).toEqual(room);
      expect(RoomService.getRoomByIdOrCode(room.code)).toEqual(room);
      expect(RoomService.getRoomByIdOrCode('invalid')).toBeUndefined();
    });
  });

  describe('updateRoomPlayers', () => {
    it('deve atualizar jogadores', () => {
      const room = RoomService.createRoom();
      const newPlayers = [{ id: '1', name: 'Ana', score: 10, isLocal: true, positionDelta: 0 }];
      const updated = RoomService.updateRoomPlayers(room.id, newPlayers);
      expect(updated?.players).toEqual(newPlayers);
      expect(db[room.id].players).toEqual(newPlayers);
    });
  });

  describe('joinRoom', () => {
    it('deve adicionar um novo jogador e tratar duplicatas', () => {
      const room = RoomService.createRoom();
      const res1 = RoomService.joinRoom(room.id, 'Ana');
      if ('error' in res1) throw new Error('Erro inesperado');
      expect(res1.isNew).toBe(true);
      expect(res1.player.name).toBe('Ana');
      expect(res1.player.positionDelta).toBe(0);

      const res2 = RoomService.joinRoom(room.id, 'Ana');
      if ('error' in res2) throw new Error('Erro inesperado');
      expect(res2.isNew).toBe(false);
    });
  });

  describe('updatePlayerStatus', () => {
    it('TU-01: deve atualizar status exclusivo do jogador ou retornar erros adequados', () => {
      const room = RoomService.createRoom();
      const joinRes = RoomService.joinRoom(room.id, 'Ana');
      if ('error' in joinRes) throw new Error('Erro ao juntar');
      const player = joinRes.player;

      // Status inicial padrão é 'playing'
      expect(player.status).toBe('playing');

      // Atualizar para 'stopped'
      const updated = RoomService.updatePlayerStatus(room.id, player.id, 'stopped');
      if ('error' in updated) throw new Error('Erro ao atualizar status');
      expect(updated.players[0].status).toBe('stopped');

      // Erro para status inválido
      const invalidStatusRes = RoomService.updatePlayerStatus(room.id, player.id, 'invalid' as any);
      expect(invalidStatusRes).toEqual({ error: 'Status inválido' });

      // Erro para sala não encontrada
      const invalidRoomRes = RoomService.updatePlayerStatus('invalid', player.id, 'bust');
      expect(invalidRoomRes).toEqual({ error: 'Sala não encontrada' });

      // Erro para jogador não encontrado
      const invalidPlayerRes = RoomService.updatePlayerStatus(room.id, 'invalid-player', 'frozen');
      expect(invalidPlayerRes).toEqual({ error: 'Jogador não encontrado' });
    });
  });

  describe('setDealer', () => {
    it('TU-02: deve definir apenas um jogador como Dealer por vez', () => {
      const room = RoomService.createRoom();
      const p1Res = RoomService.joinRoom(room.id, 'Ana');
      const p2Res = RoomService.joinRoom(room.id, 'Beto');
      if ('error' in p1Res || 'error' in p2Res) throw new Error('Erro ao juntar');

      const p1 = p1Res.player;
      const p2 = p2Res.player;

      // Definir P1 como dealer
      const res1 = RoomService.setDealer(room.id, p1.id);
      if ('error' in res1) throw new Error('Erro ao definir dealer');
      expect(res1.players.find(p => p.id === p1.id)?.isDealer).toBe(true);
      expect(res1.players.find(p => p.id === p2.id)?.isDealer).toBe(false);

      // Definir P2 como dealer desmarca P1
      const res2 = RoomService.setDealer(room.id, p2.id);
      if ('error' in res2) throw new Error('Erro ao definir dealer');
      expect(res2.players.find(p => p.id === p1.id)?.isDealer).toBe(false);
      expect(res2.players.find(p => p.id === p2.id)?.isDealer).toBe(true);

      // Erros
      expect(RoomService.setDealer('invalid', p1.id)).toEqual({ error: 'Sala não encontrada' });
      expect(RoomService.setDealer(room.id, 'invalid-player')).toEqual({ error: 'Jogador não encontrado' });
    });
  });

  describe('SSE', () => {
    it('deve inscrever e transmitir atualizações', () => {
      const room = RoomService.createRoom();
      let writtenData = '';
      let headers: Record<string, string> = {};
      const mockRes: any = {
        writeHead: (_status: number, h: Record<string, string>) => { headers = h; },
        write: (data: string) => { writtenData += data; },
        on: () => {},
      };
      RoomService.subscribeToRoom(room.id, mockRes);
      expect(headers['Content-Type']).toBe('text/event-stream');
      expect(writtenData).toContain(`data: {"id":"${room.id}"`);

      writtenData = '';
      RoomService.broadcastRoomUpdate(room.id);
      expect(writtenData).toContain(`data: {"id":"${room.id}"`);
    });
  });
});
