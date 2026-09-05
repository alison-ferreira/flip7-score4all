import { Player, PlayerStatus } from '../types';
import ControllerPlayerRow from './ControllerPlayerRow';

type ControllerRankingListProps = {
  players: Player[];
  controllerPlayerId?: string | null;
  onOpenKeypad: (player: Player) => void;
  onRemove: (id: string) => void;
  onUpdateStatus: (playerId: string, status: PlayerStatus) => void;
  onSetDealer: (playerId: string) => void;
};

export default function ControllerRankingList({
  players,
  controllerPlayerId,
  onOpenKeypad,
  onRemove,
  onUpdateStatus,
  onSetDealer,
}: ControllerRankingListProps) {
  if (players.length === 0) {
    return <div className="text-center text-slate-400 py-2">Nenhum jogador.</div>;
  }

  return (
    <div className="ranking-list">
      {players.map((p, i) => (
        <ControllerPlayerRow
          key={p.id}
          player={p}
          index={i}
          isCurrentController={p.id === controllerPlayerId}
          onOpenKeypad={onOpenKeypad}
          onRemove={onRemove}
          onUpdateStatus={onUpdateStatus}
          onSetDealer={onSetDealer}
        />
      ))}
    </div>
  );
}
