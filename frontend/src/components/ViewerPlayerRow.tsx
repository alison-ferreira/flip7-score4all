import { motion } from 'framer-motion';
import { Player } from '../types';
import DeltaIndicator from './DeltaIndicator';
import ViewerPlayerDetails from './ViewerPlayerDetails';

type ViewerPlayerRowProps = {
  player: Player;
  index: number;
  isCurrentViewer: boolean;
};

export default function ViewerPlayerRow({ player, index, isCurrentViewer }: ViewerPlayerRowProps) {
  const isGhostController = Boolean(player.isController && player.status === undefined);
  const isFirst = index === 0 && player.score > 0 && !isGhostController;
  const medal = isGhostController
    ? '—'
    : index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`player-row ${isFirst ? 'first' : ''} ${isGhostController ? 'opacity-50 grayscale bg-slate-900/40 border-dashed border-slate-700' : ''}`}
      data-testid={isGhostController ? 'ghost-controller-row' : undefined}
    >
      <div className="rank-pos">{medal}</div>
      <ViewerPlayerDetails
        player={player}
        isCurrentViewer={isCurrentViewer}
        isGhostController={isGhostController}
      />
      {!isGhostController && <DeltaIndicator delta={player.positionDelta} />}
    </motion.div>
  );
}
