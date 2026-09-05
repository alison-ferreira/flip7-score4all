import { v4 as uuidv4 } from 'uuid';
import { Room, Player, CreateRoomInput, db } from './roomTypes';
import { generateShortCode } from './roomUtils';

function createControllerPlayer(name: string, isPlaying: boolean): Player {
  const basePlayer: Player = {
    id: uuidv4(),
    name,
    score: 0,
    isLocal: true,
    positionDelta: 0,
    isController: true,
  };
  if (!isPlaying) {
    return basePlayer;
  }
  return {
    ...basePlayer,
    status: 'playing',
    isDealer: false,
  };
}

export function createRoom(input?: CreateRoomInput): Room | { error: string } {
  const trimmedName = input?.controllerName?.trim();
  if (!trimmedName) {
    return { error: 'Nome do controlador é obrigatório' };
  }
  const roomId = uuidv4();
  const code = generateShortCode();
  const isPlaying = Boolean(input?.isControllerPlaying);
  const controllerPlayer = createControllerPlayer(trimmedName, isPlaying);
  const room: Room = {
    id: roomId,
    code,
    createdAt: Date.now(),
    round: 1,
    players: [controllerPlayer],
    controllerName: trimmedName,
    controllerPlayerId: isPlaying ? controllerPlayer.id : null,
    isControllerPlaying: isPlaying,
  };
  db[roomId] = room;
  return room;
}

export function handleControllerOnUpdatePlayers(room: Room, players: Player[]): Player[] {
  const hasController = players.some(
    p => p.isController || (room.controllerPlayerId !== null && p.id === room.controllerPlayerId)
  );
  if (hasController) {
    return players.map(p => (p.id === room.controllerPlayerId ? { ...p, isController: true } : p));
  }
  room.controllerPlayerId = null;
  room.isControllerPlaying = false;
  const ghostPlayer = createControllerPlayer(room.controllerName, false);
  return [...players, ghostPlayer];
}

export function resetGame(roomId: string, isControllerPlaying: boolean): Room | { error: string } {
  const room = db[roomId];
  if (!room) {
    return { error: 'Sala não encontrada' };
  }
  room.round = 1;
  const existingController = room.players.find(p => p.isController);
  const controllerId = existingController?.id ?? uuidv4();
  const updatedPlayers = room.players.map(player => {
    delete player.roundDraft;
    const isCtrl = player.isController || player.id === existingController?.id;
    if (isCtrl) {
      return {
        id: controllerId,
        name: room.controllerName,
        score: 0,
        isLocal: true,
        positionDelta: 0,
        isController: true,
        ...(isControllerPlaying ? { status: 'playing' as const, isDealer: false } : {}),
      };
    }
    return {
      ...player,
      score: 0,
      positionDelta: 0,
      status: 'playing' as const,
      isDealer: false,
    };
  });
  room.controllerPlayerId = isControllerPlaying ? controllerId : null;
  room.isControllerPlaying = isControllerPlaying;
  const nonControllers = updatedPlayers.filter(p => !p.isController);
  const controllers = updatedPlayers.filter(p => p.isController);
  room.players = isControllerPlaying ? updatedPlayers : [...nonControllers, ...controllers];
  return room;
}
