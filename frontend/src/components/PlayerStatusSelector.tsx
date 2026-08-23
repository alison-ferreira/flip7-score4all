import { useState } from 'react';
import { PlayerStatus } from '../types';
import { STATUS_CONFIG } from '../constants/statusConfig';

type PlayerStatusSelectorProps = {
  status?: PlayerStatus;
  onSelectStatus: (status: PlayerStatus) => void;
};


export default function PlayerStatusSelector({ status = 'playing', onSelectStatus }: PlayerStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.playing;
  const CurrentIcon = currentConfig.icon;

  function handleSelect(newStatus: PlayerStatus) {
    onSelectStatus(newStatus);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${currentConfig.bgClass} transition-colors`}
        aria-expanded={isOpen}
        aria-label={`Status atual: ${currentConfig.label}. Clique para alterar.`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        <span>{currentConfig.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-32 rounded-md bg-slate-800 border border-slate-700 shadow-lg p-1 flex flex-col gap-1">
          {(Object.keys(STATUS_CONFIG) as PlayerStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const Icon = cfg.icon;
            const isSelected = st === status;
            return (
              <button
                key={st}
                type="button"
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs w-full text-left transition-colors ${
                  isSelected ? 'bg-slate-700 font-semibold' : 'hover:bg-slate-700/60'
                } ${cfg.bgClass}`}
                aria-pressed={isSelected}
                onClick={() => handleSelect(st)}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
