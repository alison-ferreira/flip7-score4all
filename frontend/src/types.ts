export type PlayerStatus = 'playing' | 'stopped' | 'bust' | 'frozen';

export type PlayerRoundDraft = {
  selectedNumbers: number[];
  selectedBonus: number[];
  isMultiplierActive: boolean;
  total: number;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
  positionDelta: number;
  status?: PlayerStatus;
  isDealer?: boolean;
  roundDraft?: PlayerRoundDraft;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  round: number;
  players: Player[];
};
