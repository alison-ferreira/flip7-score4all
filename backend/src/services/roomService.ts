import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { subscribeToRoom, broadcastRoomUpdate, clients } from './sseService';

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
  positionDelta: number;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  round: number;
  players: Player[];
};

export const db: Record<string, Room> = {};
export { clients };

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const RoomService = {
  createRoom(): Room {
    const roomId = uuidv4();
    const code = generateShortCode();
    const room: Room = { id: roomId, code, createdAt: Date.now(), round: 1, players: [] };
    db[roomId] = room;
    return room;
  },

  getRoomByIdOrCode(idOrCode: string): Room | undefined {
    let room = db[idOrCode];
    if (!room) {
      room = Object.values(db).find(r => r.code === idOrCode) as Room;
    }
    return room;
  },

  updateRoomPlayers(roomId: string, players: Player[]): Room | undefined {
    if (!db[roomId]) return undefined;
    db[roomId].players = players;
    return db[roomId];
  },

  joinRoom(idOrCode: string, name: string): { room: Room, player: Player, isNew?: boolean } | { error: string } {
    const room = this.getRoomByIdOrCode(idOrCode);
    if (!room) return { error: 'Sala não encontrada' };
    const trimmedName = name.trim();
    if (!trimmedName) return { error: 'Nome é obrigatório' };
    const existingPlayer = room.players.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingPlayer) return { room, player: existingPlayer, isNew: false };
    const newPlayer: Player = { id: uuidv4(), name: trimmedName, score: 0, isLocal: false, positionDelta: 0 };
    room.players.push(newPlayer);
    return { room, player: newPlayer, isNew: true };
  },

  subscribeToRoom(roomId: string, res: Response): void {
    subscribeToRoom(roomId, res);
  },

  finishRound(roomId: string, roundScores: Record<string, number>): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };
    const oldRanking = [...room.players].sort((a, b) => b.score - a.score);
    const oldPositions = new Map<string, number>();
    oldRanking.forEach((p, index) => oldPositions.set(p.id, index));
    room.players.forEach(p => {
      p.score += (roundScores[p.id] || 0);
    });
    const newRanking = [...room.players].sort((a, b) => b.score - a.score);
    const newPositions = new Map<string, number>();
    newRanking.forEach((p, index) => newPositions.set(p.id, index));
    room.players.forEach(p => {
      const oldPos = oldPositions.get(p.id) ?? 0;
      const newPos = newPositions.get(p.id) ?? 0;
      p.positionDelta = oldPos - newPos;
    });
    room.round += 1;
    return room;
  },

  broadcastRoomUpdate(roomId: string): void {
    broadcastRoomUpdate(roomId);
  }
};
