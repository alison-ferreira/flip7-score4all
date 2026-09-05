import { STATUS_CONFIG } from '../constants/statusConfig';
import { Player } from '../types';

type ViewerHeaderProps = {
  code: string;
  round: number;
  localPlayer?: Player;
};

export default function ViewerHeader({ code, round, localPlayer }: ViewerHeaderProps) {
  const localStatus = localPlayer?.status || 'playing';
  const statusCfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.playing;
  const StatusIcon = statusCfg.icon;

  return (
    <header className="flex flex-col gap-3 room-header p-4">
      <div className="flex justify-between items-center w-full justify-items-center">
        <h1>Ranking</h1>
        <div className="room-code">SALA: {code}</div>
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="text-lg font-bold text-slate-400">Rodada {round}</div>
        {localPlayer && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${statusCfg.bgClass}`}
            aria-label={`Seu status: ${statusCfg.label}`}
            data-testid="local-player-status-banner"
          >
            <span className="text-xs opacity-75">Seu Status:</span>
            <StatusIcon className="w-4 h-4" />
            <span className="font-bold">{statusCfg.label}</span>
          </div>
        )}
      </div>
    </header>
  );
}
