import { useState, FormEvent } from 'react';

type ControllerSetupProps = {
  onSubmit: (name: string, isPlaying: boolean) => void;
  isLoading?: boolean;
};

export default function ControllerSetup({ onSubmit, isLoading }: ControllerSetupProps) {
  const [name, setName] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, isPlaying);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <label htmlFor="controller-name-input" className="text-sm font-medium text-slate-200">
        Seu Nome
      </label>
      <input
        id="controller-name-input"
        type="text"
        placeholder="Digite seu nome..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
        autoFocus
      />
      <div className="flex items-center gap-3">
        <input
          id="participate-toggle"
          type="checkbox"
          checked={isPlaying}
          onChange={(e) => setIsPlaying(e.target.checked)}
          className="w-4 h-4 rounded text-amber-500"
        />
        <label htmlFor="participate-toggle" className="text-sm text-slate-300 cursor-pointer">
          {isPlaying ? 'Participar como jogador' : 'Somente controlar'}
        </label>
      </div>
      <button
        type="submit"
        disabled={!name.trim() || isLoading}
        className="btn-primary mt-2"
        aria-label="Confirmar configuração do controlador"
      >
        {isLoading ? 'Iniciando...' : 'Entrar na Sala'}
      </button>
    </form>
  );
}
