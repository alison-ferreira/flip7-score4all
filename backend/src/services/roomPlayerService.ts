import { v4 as uuidv4 } from 'uuid';
import { PlayerStatus, PlayerRoundDraft, Player, Room, db } from './roomTypes';

export function joinRoom(
  room: Room | undefined,
  name: string
): { room: Room; player: Player; isNew?: boolean } | { error: string } {
  if (!room) return { error: 'Sala não encontrada' };
  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Nome é obrigatório' };
  const normalized = trimmedName.toLowerCase();
  const existingPlayer = room.players.find(p => p.name.toLowerCase() === normalized)
    ?? (room.controllerName.toLowerCase() === normalized ? room.players.find(p => p.isController) : undefined);
  if (existingPlayer) return { room, player: existingPlayer, isNew: false };
  const newPlayer: Player = {
    id: uuidv4(),
    name: trimmedName,
    score: 0,
    isLocal: false,
    positionDelta: 0,
    status: 'playing',
    isDealer: false,
  };
  room.players.push(newPlayer);
  return { room, player: newPlayer, isNew: true };
}

export function updatePlayerStatus(roomId: string, playerId: string, status: PlayerStatus): Room | { error: string } {
  const room = db[roomId];
  if (!room) return { error: 'Sala não encontrada' };
  const validStatuses: PlayerStatus[] = ['playing', 'stopped', 'bust', 'frozen'];
  if (!validStatuses.includes(status)) return { error: 'Status inválido' };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Jogador não encontrado' };
  player.status = status;
  return room;
}

export function updatePlayerDraft(roomId: string, playerId: string, draft: PlayerRoundDraft): Room | { error: string } {
  const room = db[roomId];
  if (!room) return { error: 'Sala não encontrada' };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Jogador não encontrado' };
  player.roundDraft = draft;
  return room;
}

export function setDealer(roomId: string, playerId: string): Room | { error: string } {
  const room = db[roomId];
  if (!room) return { error: 'Sala não encontrada' };
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Jogador não encontrado' };
  room.players.forEach(p => { p.isDealer = p.id === playerId; });
  return room;
}
