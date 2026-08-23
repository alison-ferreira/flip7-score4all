import { subscribeToRoom, broadcastRoomUpdate, clients } from './sseService';

export type PlayerStatus = 'playing' | 'stopped' | 'bust' | 'frozen';

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
  positionDelta: number;
  status?: PlayerStatus;
  isDealer?: boolean;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  round: number;
  players: Player[];
};

export const db: Record<string, Room> = {};
export { clients, subscribeToRoom, broadcastRoomUpdate };
