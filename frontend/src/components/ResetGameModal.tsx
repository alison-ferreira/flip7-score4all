import { useState } from 'react';

type ResetGameModalProps = {
  isOpen: boolean;
  initialIsPlaying?: boolean;
  onConfirm: (isControllerPlaying: boolean) => void;
  onCancel: () => void;
};

export default function ResetGameModal({
  isOpen,
  initialIsPlaying = true,
  onConfirm,
  onCancel,
}: ResetGameModalProps) {
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full flex flex-col gap-4">
        <h2 id="reset-modal-title" className="text-lg font-bold text-white mb-0">
          Reiniciar Partida
        </h2>
        <p className="text-sm text-slate-300">
          Todas as pontuações e status serão zerados e a partida voltará à rodada 1.
        </p>
        <div className="flex items-center gap-3">
          <input
            id="reset-participate-toggle"
            type="checkbox"
            checked={isPlaying}
            onChange={(e) => setIsPlaying(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500"
          />
          <label htmlFor="reset-participate-toggle" className="text-sm text-slate-300 cursor-pointer">
            {isPlaying ? 'Participar como jogador' : 'Somente controlar'}
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary text-sm bg-rose-600 hover:bg-rose-500"
            onClick={() => onConfirm(isPlaying)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
