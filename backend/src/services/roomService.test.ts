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
