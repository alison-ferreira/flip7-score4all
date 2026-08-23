import { useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomSync } from '../hooks/useRoomSync';
import { AnimatePresence } from 'framer-motion';
import ViewerPlayerRow from '../components/ViewerPlayerRow';
import { joinRoom as apiJoinRoom } from '../lib/api/roomApi';
import { STATUS_CONFIG } from '../constants/statusConfig';

export default function RoomViewer() {
  const { code } = useParams<{ code: string }>();
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const { room, setRoom } = useRoomSync(code, hasJoined);

  function handleJoin(e: FormEvent): void {
    e.preventDefault();
    if (!playerName.trim() || !code) return;
    setLoading(true);
    apiJoinRoom(code, playerName)
      .then((data) => {
        setRoom(data.room);
        setHasJoined(true);
      })
      .catch(() => alert('Erro ao entrar na sala.'))
      .finally(() => setLoading(false));
  }

  if (!hasJoined) {
    return (
      <div className="container">
        <header>
          <h1>Flip7 Score4All</h1>
        </header>
        <div className="panel">
          <h2 className="justify-center">Entrar na Sala {code}</h2>
          <form onSubmit={handleJoin} className="input-group">
            <input type="text" placeholder="Seu Nome" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? '...' : 'Entrar'}</button>
          </form>
        </div>
      </div>
    );
  }

  if (!room) return <div className="container"><p className="w-full text-center">Carregando sala...</p></div>;

  const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const localPlayer = room.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
  const localStatus = localPlayer?.status || 'playing';
  const statusCfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.playing;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="container">
      <header className="flex flex-col gap-3 room-header p-4">
        <div className="flex justify-between items-center w-full justify-items-center">
          <h1>Ranking</h1>
          <div className="room-code">SALA: {room.code}</div>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="text-lg font-bold text-slate-400">Rodada {room.round}</div>
          {localPlayer && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${statusCfg.bgClass}`}
              aria-label={`Seu status: ${statusCfg.label}`}
              data-testid="local-player-status-banner"
            >
              <span className="text-xs opacity-75">Seu Status:</span>
              <StatusIcon className="w-4 h-4" />
              <span className="font-bold">{statusCfg.label}</span>
            </div>
          )}
        </div>
      </header>

      <div className="panel">
        <div className="ranking-list">
          {rankedPlayers.length === 0 ? (
            <div className="text-center text-slate-400">Nenhum jogador na sala ainda.</div>
          ) : (
            <AnimatePresence>
              {rankedPlayers.map((p, i) => (
                <ViewerPlayerRow
                  key={p.id}
                  player={p}
                  index={i}
                  isCurrentViewer={p.name.toLowerCase() === playerName.toLowerCase()}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

