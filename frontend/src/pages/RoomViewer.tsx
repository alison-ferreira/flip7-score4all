import { useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomSync } from '../hooks/useRoomSync';
import { AnimatePresence } from 'framer-motion';
import ViewerPlayerRow from '../components/ViewerPlayerRow';
import ViewerHeader from '../components/ViewerHeader';
import { joinRoom as apiJoinRoom } from '../lib/api/roomApi';

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
        <header><h1>Flip7 Score4All</h1></header>
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

  const rankedActive = [...room.players]
    .filter((p) => !(p.isController && !room.isControllerPlaying))
    .sort((a, b) => b.score - a.score);
  const ghost = room.players.find((p) => p.isController && !room.isControllerPlaying);
  const rankedPlayers = ghost ? [...rankedActive, ghost] : rankedActive;
  const localPlayer = room.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());

  return (
    <div className="container">
      <ViewerHeader code={room.code} round={room.round} localPlayer={localPlayer} />
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
