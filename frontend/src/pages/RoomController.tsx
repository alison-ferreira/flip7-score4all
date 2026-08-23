import { useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import ScoreKeypad from '../components/ScoreKeypad';
import ControllerPlayerRow from '../components/ControllerPlayerRow';
import ControllerHeader from '../components/ControllerHeader';
import { Player, PlayerStatus } from '../types';
import { useRoomSync } from '../hooks/useRoomSync';
import { saveRoomState, finishRound as apiFinishRound, updatePlayerStatus, setDealer } from '../lib/api/roomApi';

export default function RoomController() {
  const { code } = useParams<{ code: string }>();
  const { room, setRoom } = useRoomSync(code);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [calcPlayer, setCalcPlayer] = useState<Player | null>(null);
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});

  function handleSavePlayers(updatedPlayers: Player[]): void {
    if (room) saveRoomState(room.id, updatedPlayers).then(setRoom).catch(console.error);
  }

  function handleAddLocalPlayer(e: FormEvent): void {
    e.preventDefault();
    if (!localPlayerName.trim()) return;
    const newPlayer: Player = { id: Date.now().toString(), name: localPlayerName.trim(), score: 0, isLocal: true, positionDelta: 0, status: 'playing', isDealer: false };
    handleSavePlayers([...(room?.players || []), newPlayer]);
    setLocalPlayerName('');
  }

  function handleScoreConfirm(points: number): void {
    if (calcPlayer) setRoundScores((prev) => ({ ...prev, [calcPlayer.id]: (prev[calcPlayer.id] || 0) + points }));
    setCalcPlayer(null);
  }

  function handleFinishRound(): void {
    if (room) apiFinishRound(room.id, roundScores).then(() => setRoundScores({})).catch(console.error);
  }

  function handleUpdateStatus(playerId: string, status: PlayerStatus): void {
    if (room) updatePlayerStatus(room.id, playerId, status).then(setRoom).catch(console.error);
  }

  function handleSetDealer(playerId: string): void {
    if (room) setDealer(room.id, playerId).then(setRoom).catch(console.error);
  }

  if (!room) return <div className="container"><p className="w-full text-center">Carregando sala...</p></div>;

  const rankedPlayers = [...room.players]
    .map((p) => ({ ...p, displayScore: p.score + (roundScores[p.id] || 0) }))
    .sort((a, b) => b.displayScore - a.displayScore);

  return (
    <div className="container">
      <ControllerHeader round={room.round} code={room.code} />
      <div className="panel">
        <h2 className="flex justify-between items-center">
          Ranking & Ações
          <div>
            <button className="mr-2 text-xs btn-secondary" onClick={() => room && handleSavePlayers(room.players.map((p) => ({ ...p, score: 0, positionDelta: 0, status: 'playing', isDealer: false })))}>Reiniciar</button>
            <button className="text-xs bg-emerald-600 btn-primary" aria-label="Finalizar Rodada" onClick={handleFinishRound}>Finalizar Rodada</button>
          </div>
        </h2>
        <form className="input-group" onSubmit={handleAddLocalPlayer}>
          <input type="text" placeholder="Adicionar jogador presencial..." value={localPlayerName} onChange={(e) => setLocalPlayerName(e.target.value)} required />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        <div className="ranking-list">
          {rankedPlayers.length === 0 && <div className="text-center text-slate-400">Nenhum jogador.</div>}
          {rankedPlayers.map((p, i) => (
            <ControllerPlayerRow key={p.id} player={p} index={i} roundScore={roundScores[p.id] || 0} onOpenKeypad={setCalcPlayer} onRemove={(id) => room && handleSavePlayers(room.players.filter((item) => item.id !== id))} onUpdateStatus={handleUpdateStatus} onSetDealer={handleSetDealer} />
          ))}
        </div>
      </div>
      {calcPlayer && <ScoreKeypad player={calcPlayer} onConfirm={handleScoreConfirm} onCancel={() => setCalcPlayer(null)} />}
    </div>
  );
}
