import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Player } from '../types';
import { STATUS_CONFIG } from '../constants/statusConfig';
import DeltaIndicator from './DeltaIndicator';

type ViewerPlayerRowProps = {
  player: Player;
  index: number;
  isCurrentViewer: boolean;
};

export default function ViewerPlayerRow({ player, index, isCurrentViewer }: ViewerPlayerRowProps) {
  const isFirst = index === 0 && player.score > 0;
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
  const currentStatus = player.status || 'playing';
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.playing;
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`player-row ${isFirst ? 'first' : ''}`}
    >
      <div className="rank-pos">{medal}</div>
      <div className="player-details">
        <div className="player-name">
          {player.name}
          {isCurrentViewer && <span className="local-badge text-black bg-amber-400">Você</span>}
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
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${statusCfg.bgClass}`}
            aria-label={`Status: ${statusCfg.label}`}
            title={statusCfg.label}
            data-testid="player-status-badge"
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusCfg.label}</span>
          </span>
        </div>
      </div>
      <DeltaIndicator delta={player.positionDelta} />
    </motion.div>
  );
}

