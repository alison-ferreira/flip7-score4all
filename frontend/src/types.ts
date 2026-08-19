export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  players: Player[];
};
