import { Crown } from 'lucide-react';

type DealerButtonProps = {
  isDealer?: boolean;
  onSetDealer: () => void;
};

export default function DealerButton({ isDealer = false, onSetDealer }: DealerButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
        isDealer
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
          : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/30'
      }`}
      aria-label={isDealer ? 'Dealer atual' : 'Definir como Dealer'}
      onClick={onSetDealer}
    >
      <Crown className={`w-3.5 h-3.5 ${isDealer ? 'text-amber-400 fill-amber-400/30' : ''}`} />
      <span>Dealer</span>
    </button>
  );
}
