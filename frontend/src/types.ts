export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
  positionDelta?: number;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  round: number;
  players: Player[];
};
