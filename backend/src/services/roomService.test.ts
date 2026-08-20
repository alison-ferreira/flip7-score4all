import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db } from './roomService';

describe('RoomService', () => {
  beforeEach(() => {
    Object.keys(db).forEach(key => delete db[key]);
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
    it('deve retornar sala pelo ID', () => {
      const room = RoomService.createRoom();
      const fetchedRoom = RoomService.getRoomByIdOrCode(room.id);
      expect(fetchedRoom).toEqual(room);
    });

    it('deve retornar sala pelo codigo', () => {
      const room = RoomService.createRoom();
      const fetchedRoom = RoomService.getRoomByIdOrCode(room.code);
      expect(fetchedRoom).toEqual(room);
    });

    it('deve retornar undefined se não encontrada', () => {
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
    it('deve adicionar um novo jogador e retornar isNew true, com positionDelta 0', () => {
      const room = RoomService.createRoom();
      const result = RoomService.joinRoom(room.id, 'Ana');
      
      if ('error' in result) {
        throw new Error('Retornou erro inesperado');
      }
      
      expect(result.isNew).toBe(true);
      expect(result.player.name).toBe('Ana');
      expect(result.player.positionDelta).toBe(0);
      expect(result.player.score).toBe(0);
      expect(result.room.players).toHaveLength(1);
    });

    it('deve retornar isNew false ao tentar adicionar jogador existente', () => {
      const room = RoomService.createRoom();
      RoomService.joinRoom(room.id, 'Ana');
      
      const result = RoomService.joinRoom(room.id, 'Ana');
      
      if ('error' in result) {
        throw new Error('Retornou erro inesperado');
      }
      
      expect(result.isNew).toBe(false);
      expect(result.player.name).toBe('Ana');
      expect(result.room.players).toHaveLength(1);
    });
  });

  describe('SSE (Server-Sent Events)', () => {
    it('deve inscrever e transmitir atualizações', () => {
      const room = RoomService.createRoom();
      
      let writtenData = '';
      let headers: any = {};
      
      const mockRes: any = {
        writeHead: (_status: number, h: any) => { headers = h; },
        write: (data: string) => { writtenData += data; },
        on: (_event: string, _cb: Function) => { /* mock */ }
      };

      RoomService.subscribeToRoom(room.id, mockRes);
      
      expect(headers['Content-Type']).toBe('text/event-stream');
      expect(writtenData).toContain(`data: {"id":"${room.id}"`);

      // test broadcast
      writtenData = ''; // reset
      RoomService.broadcastRoomUpdate(room.id);
      expect(writtenData).toContain(`data: {"id":"${room.id}"`);
    });
  });

  describe('finishRound', () => {
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
      
      // Initial score setup so that P1=30, P2=20, P3=10
      // Positions: P1 (1st), P2 (2nd), P3 (3rd)
      const p1 = room.players.find(p => p.name === 'P1')!;
      const p2 = room.players.find(p => p.name === 'P2')!;
      const p3 = room.players.find(p => p.name === 'P3')!;
      
      p1.score = 30;
      p2.score = 20;
      p3.score = 10;
      
      // P3 scores 100 points, jumping to 110. P1 and P2 score 0.
      // New scores: P3=110 (1st), P1=30 (2nd), P2=20 (3rd).
      // P3 moved from 3rd (index 2) to 1st (index 0). Delta = 2 - 0 = 2.
      const roundScores = {
        [p3.id]: 100
      };
      
      RoomService.finishRound(room.id, roundScores);
      
      expect(p3.positionDelta).toBe(2);
    });

    it('TU-03: deve calcular descida de posição (positionDelta < 0)', () => {
      const room = RoomService.createRoom();
      RoomService.joinRoom(room.id, 'P1');
      RoomService.joinRoom(room.id, 'P2');
      
      const p1 = room.players.find(p => p.name === 'P1')!;
      const p2 = room.players.find(p => p.name === 'P2')!;
      
      // Initial: P1=50 (1st), P2=10 (2nd)
      p1.score = 50;
      p2.score = 10;
      
      // P2 scores 100, P1 scores 0
      // New: P2=110 (1st), P1=50 (2nd)
      // P1 moved from 1st (index 0) to 2nd (index 1). Delta = 0 - 1 = -1.
      RoomService.finishRound(room.id, { [p2.id]: 100 });
      
      expect(p1.positionDelta).toBe(-1);
    });

    it('TU-04: deve calcular manutenção de posição (positionDelta === 0)', () => {
      const room = RoomService.createRoom();
      RoomService.joinRoom(room.id, 'P1');
      RoomService.joinRoom(room.id, 'P2');
      
      const p1 = room.players.find(p => p.name === 'P1')!;
      const p2 = room.players.find(p => p.name === 'P2')!;
      
      // Initial: P1=50 (1st), P2=10 (2nd)
      p1.score = 50;
      p2.score = 10;
      
      // Both score 10
      // New: P1=60 (1st), P2=20 (2nd)
      // Positions remain same. Deltas should be 0.
      RoomService.finishRound(room.id, { [p1.id]: 10, [p2.id]: 10 });
      
      expect(p1.positionDelta).toBe(0);
      expect(p2.positionDelta).toBe(0);
    });
  });
});
