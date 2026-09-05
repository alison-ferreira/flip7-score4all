type ControllerHeaderProps = {
  round: number;
  code: string;
  controllerName?: string;
};

export default function ControllerHeader({ round, code, controllerName }: ControllerHeaderProps) {
  return (
    <header className="room-header">
      <div>
        <h1>Controlador - Rodada {round}</h1>
        {controllerName && (
          <div className="text-xs text-slate-400 font-medium mt-0.5">
            Mesa de <span className="text-amber-300 font-semibold">{controllerName}</span>
          </div>
        )}
      </div>
      <div className="room-code">SALA: {code}</div>
    </header>
  );
}
