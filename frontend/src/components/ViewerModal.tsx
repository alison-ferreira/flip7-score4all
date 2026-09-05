import { useEffect, useRef } from 'react';
import { Room } from '../types';
import { STATUS_CONFIG } from '../constants/statusConfig';
import ViewerPlayerRow from './ViewerPlayerRow';
import ViewerModalHeader from './ViewerModalHeader';

type ViewerModalProps = {
  isOpen: boolean;
  room: Room;
  onClose: () => void;
};

export default function ViewerModal({ isOpen, room, onClose }: ViewerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const controller = room.controllerPlayerId
    ? room.players.find((p) => p.id === room.controllerPlayerId)
    : undefined;
  const statusCfg = STATUS_CONFIG[controller?.status || 'playing'] || STATUS_CONFIG.playing;
  const StatusIcon = statusCfg.icon;

  const ranked = [...room.players]
    .filter((p) => !(p.isController && !room.isControllerPlaying))
    .sort((a, b) => b.score - a.score);
  const ghost = room.players.find((p) => p.isController && !room.isControllerPlaying);
  const displayPlayers = ghost ? [...ranked, ghost] : ranked;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-4 flex flex-col items-center outline-none"
    >
      <div className="w-full max-w-lg flex flex-col gap-4">
        <ViewerModalHeader code={room.code} round={room.round} onClose={onClose} />
        {controller && room.isControllerPlaying && (
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${statusCfg.bgClass}`}
            aria-label={`Seu status: ${statusCfg.label}`}
          >
            <div className="flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">Seu Status: {statusCfg.label}</span>
            </div>
            <span className="font-bold">{controller.score} pts</span>
          </div>
        )}
        <div className="panel p-4">
          <div className="ranking-list flex flex-col gap-2">
            {displayPlayers.length === 0 ? (
              <div className="text-center text-slate-400 py-4">Nenhum jogador na sala.</div>
            ) : (
              displayPlayers.map((p, i) => (
                <ViewerPlayerRow
                  key={p.id}
                  player={p}
                  index={i}
                  isCurrentViewer={p.id === room.controllerPlayerId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
