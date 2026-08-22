type DeltaIndicatorProps = {
  delta: number;
};

export default function DeltaIndicator({ delta }: DeltaIndicatorProps) {
  if (delta > 0) {
    return (
      <span aria-label={`Subiu ${delta} posições no ranking`} className="ml-2 text-lg text-emerald-400">
        ⬆️ {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span aria-label={`Caiu ${Math.abs(delta)} posições no ranking`} className="ml-2 text-lg text-rose-400">
        ⬇️ {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span aria-label="Manteve posição" className="ml-2 text-lg text-slate-400">
      ➖
    </span>
  );
}
