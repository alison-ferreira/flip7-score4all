import { PlayCircle, PauseCircle, Flame, Snowflake, LucideIcon } from 'lucide-react';
import { PlayerStatus } from '../types';

export type StatusItemConfig = {
  label: string;
  bgClass: string;
  icon: LucideIcon;
};

export const STATUS_CONFIG: Record<PlayerStatus, StatusItemConfig> = {
  playing: { label: 'Jogando', bgClass: 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50', icon: PlayCircle },
  stopped: { label: 'Parou', bgClass: 'bg-slate-700/50 text-slate-200 border-slate-500/50', icon: PauseCircle },
  bust: { label: 'Estourou', bgClass: 'bg-rose-600/30 text-rose-400 border-rose-500/50', icon: Flame },
  frozen: { label: 'Congelado', bgClass: 'bg-sky-600/30 text-sky-400 border-sky-500/50', icon: Snowflake },
};
