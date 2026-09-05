import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom as apiCreateRoom } from '../lib/api/roomApi';
import ControllerSetup from '../components/ControllerSetup';

export default function Home() {
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleCreateRoom(controllerName: string, isControllerPlaying: boolean): void {
    setLoading(true);
    apiCreateRoom({ controllerName, isControllerPlaying })
      .then((room) => navigate(`/room/${room.code}/controller`))
      .catch(() => alert('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false));
  }

  function handleJoinRoom(e: FormEvent): void {
    e.preventDefault();
    if (!joinCode.trim()) return;
    navigate(`/room/${joinCode.toUpperCase()}`);
  }

  return (
    <div className="container">
      <header>
        <h1>Flip7 Score4All</h1>
      </header>

      <div className="panel">
        <h2 className="justify-center mb-0">Controlador</h2>
        <p className="text-sm text-center text-slate-400">
          Crie uma nova sala para gerenciar a pontuação.
        </p>
        {isCreating ? (
          <div className="mt-2">
            <ControllerSetup onSubmit={handleCreateRoom} isLoading={loading} />
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white underline"
                onClick={() => setIsCreating(false)}
                disabled={loading}
              >
                Voltar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="mt-2.5 btn-primary"
            onClick={() => setIsCreating(true)}
            disabled={loading}
          >
            Criar Nova Sala
          </button>
        )}
      </div>

      <div className="mt-5 panel">
        <h2 className="justify-center mb-0">Visualizador</h2>
        <p className="text-sm text-center text-slate-400">
          Entre em uma sala existente para acompanhar o placar.
        </p>
        <form onSubmit={handleJoinRoom} className="mt-2.5 input-group">
          <input
            type="text"
            placeholder="Ex: A4B2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            required
            className="text-center uppercase"
          />
          <button type="submit" className="btn-accent">Entrar</button>
        </form>
      </div>
    </div>
  );
}
