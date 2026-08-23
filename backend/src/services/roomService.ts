import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { PlayerStatus, PlayerRoundDraft, Player, Room, db, clients, subscribeToRoom, broadcastRoomUpdate } from './roomTypes';
import { generateShortCode, updateScoresAndCalculateDeltas } from './roomUtils';

export type { PlayerStatus, PlayerRoundDraft, Player, Room };
export { db, clients };

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
    const newPlayer: Player = { id: uuidv4(), name: trimmedName, score: 0, isLocal: false, positionDelta: 0, status: 'playing', isDealer: false };
    room.players.push(newPlayer);
    return { room, player: newPlayer, isNew: true };
  },

  updatePlayerStatus(roomId: string, playerId: string, status: PlayerStatus): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };
    const validStatuses: PlayerStatus[] = ['playing', 'stopped', 'bust', 'frozen'];
    if (!validStatuses.includes(status)) return { error: 'Status inválido' };
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { error: 'Jogador não encontrado' };
    player.status = status;
    return room;
  },

  updatePlayerDraft(roomId: string, playerId: string, draft: PlayerRoundDraft): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { error: 'Jogador não encontrado' };
    player.roundDraft = draft;
    return room;
  },

  setDealer(roomId: string, playerId: string): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { error: 'Jogador não encontrado' };
    room.players.forEach(p => { p.isDealer = p.id === playerId; });
    return room;
  },

  subscribeToRoom(roomId: string, res: Response): void {
    subscribeToRoom(roomId, res);
  },

  finishRound(roomId: string, roundScores?: Record<string, number>): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };
    updateScoresAndCalculateDeltas(room.players, p => p.roundDraft ? p.roundDraft.total : (roundScores?.[p.id] || 0));
    room.round += 1;
    return room;
  },

  broadcastRoomUpdate(roomId: string): void {
    broadcastRoomUpdate(roomId);
  }
};
