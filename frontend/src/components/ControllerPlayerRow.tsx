import { Player } from '../types';

type ControllerPlayerRowProps = {
  player: Player & { displayScore: number };
  index: number;
  roundScore: number;
  onOpenKeypad: (player: Player) => void;
  onRemove: (id: string) => void;
};

export default function ControllerPlayerRow({
  player,
  index,
  roundScore,
  onOpenKeypad,
  onRemove,
}: ControllerPlayerRowProps) {
  const isFirst = index === 0 && player.score > 0;
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
  return (
    <div className={`player-row ${isFirst ? 'first' : ''}`}>
      <div className="rank-pos">{medal}</div>
      <div className="player-details">
        <div className="player-name">
          {player.name}
          {player.isLocal && <span className="local-badge">Local</span>}
        </div>
        <div className="player-score">
          {player.displayScore} pontos
          {roundScore > 0 && <span className="ml-2 text-emerald-400">(+{roundScore})</span>}
          {roundScore < 0 && <span className="ml-2 text-rose-400">({roundScore})</span>}
        </div>
      </div>
      <div className="actions">
        <button className="btn-round" onClick={() => onOpenKeypad(player)}>+ Rodada</button>
        <button className="btn-del" onClick={() => onRemove(player.id)}>✕</button>
      </div>
    </div>
  );
}
