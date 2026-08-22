import { motion } from 'framer-motion';
import { Player } from '../types';
import DeltaIndicator from './DeltaIndicator';

type ViewerPlayerRowProps = {
  player: Player;
  index: number;
  isCurrentViewer: boolean;
};

export default function ViewerPlayerRow({ player, index, isCurrentViewer }: ViewerPlayerRowProps) {
  const isFirst = index === 0 && player.score > 0;
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
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
        </div>
        <div className="player-score">{player.score} pontos</div>
      </div>
      <DeltaIndicator delta={player.positionDelta} />
    </motion.div>
  );
}
