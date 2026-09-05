import { X } from 'lucide-react';

type ViewerModalHeaderProps = {
  code: string;
  round: number;
  onClose: () => void;
};

export default function ViewerModalHeader({ code, round, onClose }: ViewerModalHeaderProps) {
  return (
    <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <div>
        <h1 id="viewer-modal-title" className="text-xl font-bold text-white">
          Visão do Jogador
        </h1>
        <p className="text-xs text-slate-400">SALA: {code} • Rodada {round}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar visão de jogador"
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
      >
        <X className="w-5 h-5" />
      </button>
    </header>
  );
}
