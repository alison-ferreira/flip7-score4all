import { Player, PlayerStatus } from '../types';
import PlayerStatusSelector from './PlayerStatusSelector';
import DealerButton from './DealerButton';

type ControllerPlayerRowProps = {
  player: Player;
  index: number;
  onOpenKeypad: (player: Player) => void;
  onRemove: (id: string) => void;
  onUpdateStatus?: (playerId: string, status: PlayerStatus) => void;
  onSetDealer?: (playerId: string) => void;
};

export default function ControllerPlayerRow({
  player,
  index,
  onOpenKeypad,
  onRemove,
  onUpdateStatus,
  onSetDealer,
}: ControllerPlayerRowProps) {
  const isFirst = index === 0 && player.score > 0;
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
  const roundDraftTotal = player.roundDraft?.total;

  return (
    <div className={`player-row ${isFirst ? 'first' : ''}`}>
      <div className="rank-pos">{medal}</div>
      <div className="player-details">
        <div className="player-name">
          {player.name}
          {player.isLocal && <span className="local-badge">Local</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="player-score">{player.score} pontos</div>
          {roundDraftTotal !== undefined && roundDraftTotal > 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs border bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold"
              aria-label={`Pontos da rodada: +${roundDraftTotal}`}
              title="Pontuação da rodada em andamento"
              data-testid="controller-round-draft-badge"
            >
              +{roundDraftTotal} rodada
            </span>
          )}
          {roundDraftTotal !== undefined && roundDraftTotal < 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs border bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold"
              aria-label={`Pontos da rodada: ${roundDraftTotal}`}
              title="Pontuação da rodada em andamento"
              data-testid="controller-round-draft-badge"
            >
              {roundDraftTotal} rodada
            </span>
          )}
        </div>
      </div>
      <div className="actions">
        {onSetDealer && (
          <DealerButton
            isDealer={player.isDealer}
            onSetDealer={() => onSetDealer(player.id)}
          />
        )}
        {onUpdateStatus && (
          <PlayerStatusSelector
            status={player.status}
            onSelectStatus={(status) => onUpdateStatus(player.id, status)}
          />
        )}
        <button type="button" className="btn-round" onClick={() => onOpenKeypad(player)}>+ Rodada</button>
        <button type="button" className="btn-del" onClick={() => onRemove(player.id)}>✕</button>
      </div>
    </div>
  );
}
