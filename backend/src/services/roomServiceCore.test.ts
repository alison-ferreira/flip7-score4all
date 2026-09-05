import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService, db, Room } from './roomService';

describe('RoomService - Core Operations', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('deve retornar sala pelo ID e pelo código', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    expect(RoomService.getRoomByIdOrCode(room.id)).toEqual(room);
    expect(RoomService.getRoomByIdOrCode(room.code)).toEqual(room);
    expect(RoomService.getRoomByIdOrCode('invalid')).toBeUndefined();
  });

  it('deve atualizar jogadores preservando o controlador quando presente', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const ctrlId = room.controllerPlayerId!;
    const updated = RoomService.updateRoomPlayers(room.id, [
      { id: ctrlId, name: 'Ana', score: 10, isLocal: true, positionDelta: 0, status: 'playing' }
    ]);
    expect(updated?.isControllerPlaying).toBe(true);
    expect(updated?.players[0].isController).toBe(true);
    expect(RoomService.updateRoomPlayers('invalid', [])).toBeUndefined();
  });

  it('deve atualizar status do jogador ou retornar erros adequados', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const player = room.players[0];
    const updated = RoomService.updatePlayerStatus(room.id, player.id, 'stopped');
    if ('error' in updated) throw new Error('Erro');
    expect(updated.players[0].status).toBe('stopped');
    expect(RoomService.updatePlayerStatus(room.id, player.id, 'invalid' as any)).toEqual({ error: 'Status inválido' });
    expect(RoomService.updatePlayerStatus('invalid', player.id, 'bust')).toEqual({ error: 'Sala não encontrada' });
    expect(RoomService.updatePlayerStatus(room.id, 'invalid-p', 'frozen')).toEqual({ error: 'Jogador não encontrado' });
  });

  it('deve definir apenas um jogador como Dealer por vez', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
    const p2Res = RoomService.joinRoom(room.id, 'Beto');
    if ('error' in p2Res) throw new Error('Erro');
    const p1Id = room.players[0].id;
    const p2Id = p2Res.player.id;
    RoomService.setDealer(room.id, p1Id);
    expect(room.players.find(p => p.id === p1Id)?.isDealer).toBe(true);
    RoomService.setDealer(room.id, p2Id);
    expect(room.players.find(p => p.id === p1Id)?.isDealer).toBe(false);
    expect(room.players.find(p => p.id === p2Id)?.isDealer).toBe(true);
    expect(RoomService.setDealer('invalid', p1Id)).toEqual({ error: 'Sala não encontrada' });
    expect(RoomService.setDealer(room.id, 'invalid-p')).toEqual({ error: 'Jogador não encontrado' });
  });

  it('deve inscrever e transmitir atualizações por SSE', () => {
    const room = RoomService.createRoom({ controllerName: 'Ana', isControllerPlaying: true }) as Room;
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
