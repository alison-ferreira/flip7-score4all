import { Gamepad2 } from 'lucide-react';
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
  isCurrentController?: boolean;
};

export default function ControllerPlayerRow({
  player,
  index,
  onOpenKeypad,
  onRemove,
  onUpdateStatus,
  onSetDealer,
  isCurrentController,
}: ControllerPlayerRowProps) {
  const isGhost = Boolean(player.isController && player.status === undefined);
  const isFirst = index === 0 && player.score > 0 && !isGhost;
  const medal = isGhost ? '—' : index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
  const draftTotal = player.roundDraft?.total;

  return (
    <div
      className={`player-row ${isFirst ? 'first' : ''} ${isGhost ? 'opacity-50 grayscale bg-slate-900/40 border-dashed border-slate-700' : ''}`}
      data-testid={isGhost ? 'ghost-controller-row' : undefined}
    >
      <div className="rank-pos">{medal}</div>
      <div className="player-details">
        <div className="player-name flex items-center gap-1.5 flex-wrap">
          <span>{player.name}</span>
          {isCurrentController && <span className="local-badge text-black bg-amber-400 font-bold">Você</span>}
          {player.isController && (
            <span
              className="flex items-center text-indigo-400"
              title="Controlador da sala"
              data-testid="controller-badge"
            >
              <Gamepad2 className="w-4 h-4" aria-label="Controlador da sala" />
            </span>
          )}
          {player.isLocal && <span className="local-badge">Local</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="player-score">{player.score} pontos</div>
          {draftTotal !== undefined && draftTotal > 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs border bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold"
              aria-label={`Pontos da rodada: +${draftTotal}`}
              title="Pontuação da rodada em andamento"
              data-testid="controller-round-draft-badge"
            >
              +{draftTotal} rodada
            </span>
          )}
          {draftTotal !== undefined && draftTotal < 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs border bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold"
              aria-label={`Pontos da rodada: ${draftTotal}`}
              title="Pontuação da rodada em andamento"
              data-testid="controller-round-draft-badge"
            >
              {draftTotal} rodada
            </span>
          )}
        </div>
      </div>
      {!isGhost && (
        <div className="actions">
          {onSetDealer && <DealerButton isDealer={player.isDealer} onSetDealer={() => onSetDealer(player.id)} />}
          {onUpdateStatus && (
            <PlayerStatusSelector status={player.status} onSelectStatus={(s) => onUpdateStatus(player.id, s)} />
          )}
          <button type="button" className="btn-round" onClick={() => onOpenKeypad(player)}>+ Rodada</button>
          <button type="button" className="btn-del" onClick={() => onRemove(player.id)}>✕</button>
        </div>
      )}
    </div>
  );
}
