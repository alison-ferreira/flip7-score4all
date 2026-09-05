import { Response } from 'express';
import {
  PlayerStatus,
  PlayerRoundDraft,
  Player,
  Room,
  CreateRoomInput,
  ResetGameInput,
  db,
  clients,
  subscribeToRoom,
  broadcastRoomUpdate,
} from './roomTypes';
import { updateScoresAndCalculateDeltas } from './roomUtils';
import { createRoom, resetGame, handleControllerOnUpdatePlayers } from './roomLifecycle';
import {
  joinRoom,
  updatePlayerStatus,
  updatePlayerDraft,
  setDealer,
} from './roomPlayerService';

export type { PlayerStatus, PlayerRoundDraft, Player, Room, CreateRoomInput, ResetGameInput };
export { db, clients };

export const RoomService = {
  createRoom(input?: CreateRoomInput): Room | { error: string } {
    return createRoom(input);
  },

  resetGame(roomId: string, isControllerPlaying: boolean): Room | { error: string } {
    return resetGame(roomId, isControllerPlaying);
  },

  getRoomByIdOrCode(idOrCode: string): Room | undefined {
    return db[idOrCode] ?? Object.values(db).find(r => r.code === idOrCode);
  },

  updateRoomPlayers(roomId: string, players: Player[]): Room | undefined {
    const room = db[roomId];
    if (!room) return undefined;
    room.players = handleControllerOnUpdatePlayers(room, players);
    return room;
  },

  joinRoom(idOrCode: string, name: string): { room: Room; player: Player; isNew?: boolean } | { error: string } {
    return joinRoom(this.getRoomByIdOrCode(idOrCode), name);
  },

  updatePlayerStatus(roomId: string, playerId: string, status: PlayerStatus): Room | { error: string } {
    return updatePlayerStatus(roomId, playerId, status);
  },

  updatePlayerDraft(roomId: string, playerId: string, draft: PlayerRoundDraft): Room | { error: string } {
    return updatePlayerDraft(roomId, playerId, draft);
  },

  setDealer(roomId: string, playerId: string): Room | { error: string } {
    return setDealer(roomId, playerId);
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
