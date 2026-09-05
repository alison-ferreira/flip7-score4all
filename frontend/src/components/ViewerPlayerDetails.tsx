import { Crown, Gamepad2 } from 'lucide-react';
import { Player } from '../types';
import { STATUS_CONFIG } from '../constants/statusConfig';

type ViewerPlayerDetailsProps = {
  player: Player;
  isCurrentViewer: boolean;
  isGhostController: boolean;
};

export default function ViewerPlayerDetails({
  player,
  isCurrentViewer,
  isGhostController,
}: ViewerPlayerDetailsProps) {
  const currentStatus = player.status || 'playing';
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.playing;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="player-details">
      <div className="player-name flex items-center gap-1.5 flex-wrap">
        <span>{player.name}</span>
        {isCurrentViewer && <span className="local-badge text-black bg-amber-400 font-bold">Você</span>}
        {player.isController && (
          <span className="flex items-center text-indigo-400" title="Controlador da sala" data-testid="controller-badge">
            <Gamepad2 className="w-4 h-4" aria-label="Controlador da sala" />
          </span>
        )}
        {player.isDealer && (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold"
            aria-label="Dealer atual"
            title="Dealer"
            data-testid="dealer-badge"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>Dealer</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="player-score">{player.score} pontos</div>
        {player.roundDraft && player.roundDraft.total > 0 && (
          <span
            className="px-2 py-0.5 rounded text-xs border bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold"
            data-testid="viewer-round-draft-badge"
          >
            +{player.roundDraft.total} rodada
          </span>
        )}
        {player.roundDraft && player.roundDraft.total < 0 && (
          <span
            className="px-2 py-0.5 rounded text-xs border bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold"
            data-testid="viewer-round-draft-badge"
          >
            {player.roundDraft.total} rodada
          </span>
        )}
        {!isGhostController && (
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${statusCfg.bgClass}`}
            aria-label={`Status: ${statusCfg.label}`}
            title={statusCfg.label}
            data-testid="player-status-badge"
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusCfg.label}</span>
          </span>
        )}
      </div>
    </div>
  );
}
