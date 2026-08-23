type ControllerHeaderProps = {
  round: number;
  code: string;
};

export default function ControllerHeader({ round, code }: ControllerHeaderProps) {
  return (
    <header className="room-header">
      <h1>Controlador - Rodada {round}</h1>
      <div className="room-code">SALA: {code}</div>
    </header>
  );
}
