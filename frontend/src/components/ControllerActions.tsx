import { Eye } from 'lucide-react';

type ControllerActionsProps = {
  onOpenViewerModal: () => void;
  onOpenResetModal: () => void;
  onFinishRound: () => void;
};

export default function ControllerActions({
  onOpenViewerModal,
  onOpenResetModal,
  onFinishRound,
}: ControllerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn-secondary text-xs flex items-center gap-1"
        onClick={onOpenViewerModal}
        aria-label="Abrir visão de jogador"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Ver como Jogador</span>
      </button>
      <button
        type="button"
        className="btn-secondary text-xs"
        onClick={onOpenResetModal}
        aria-label="Reiniciar partida"
      >
        Reiniciar
      </button>
      <button
        type="button"
        className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500"
        aria-label="Finalizar Rodada"
        onClick={onFinishRound}
      >
        Finalizar Rodada
      </button>
    </div>
  );
}
