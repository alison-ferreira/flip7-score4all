import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import ScoreKeypad from '../components/ScoreKeypad'
import { Player } from '../types'
import { useRoomSync } from '../hooks/useRoomSync'

export default function RoomController() {
  const { code } = useParams<{ code: string }>()
  const { room, setRoom } = useRoomSync(code)
  const [localPlayerName, setLocalPlayerName] = useState('')
  const [calcPlayer, setCalcPlayer] = useState<Player | null>(null)
  const [roundScores, setRoundScores] = useState<Record<string, number>>({})

  const saveRoomState = async (updatedPlayers: Player[]) => {
    if (!room) return
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: updatedPlayers })
      })
      setRoom({ ...room, players: updatedPlayers })
    } catch (e) {
      console.error('Erro ao atualizar sala', e)
    }
  }

  const addLocalPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localPlayerName.trim()) return

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: localPlayerName.trim(),
      score: 0,
      isLocal: true
    }

    const updatedPlayers = [...(room?.players || []), newPlayer]
    saveRoomState(updatedPlayers)
    setLocalPlayerName('')
  }

  const removePlayer = (id: string) => {
    if (confirm('Remover jogador do ranking?')) {
      if (!room) return
      const updatedPlayers = room.players.filter(p => p.id !== id)
      saveRoomState(updatedPlayers)
    }
  }

  const resetGame = () => {
    if (confirm('Deseja zerar a pontuação de todos os jogadores?')) {
      if (!room) return
      const updatedPlayers = room.players.map(p => ({ ...p, score: 0 }))
      saveRoomState(updatedPlayers)
    }
  }

  const handleScoreConfirm = (points: number) => {
    if (calcPlayer) {
      setRoundScores(prev => ({
        ...prev,
        [calcPlayer.id]: (prev[calcPlayer.id] || 0) + points
      }))
    }
    setCalcPlayer(null) // Fecha o modal
  }

  const finishRound = async () => {
    if (!room) return
    try {
      const res = await fetch(`/api/rooms/${room.id}/round/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundScores })
      })
      if (res.ok) {
        setRoundScores({})
      }
    } catch (e) {
      console.error('Erro ao finalizar rodada', e)
    }
  }

  if (!room) return <div className="container"><p style={{ textAlign: 'center', width: '100%' }}>Carregando sala...</p></div>

  const rankedPlayers = [...room.players].map(p => ({
    ...p,
    displayScore: p.score + (roundScores[p.id] || 0)
  })).sort((a, b) => b.displayScore - a.displayScore)

  return (
    <div className="container">
      <header className="room-header">
        <h1>Controlador - Rodada {room.round}</h1>
        <div className="room-code">SALA: {room.code}</div>
      </header>

      <div className="panel">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ranking & Ações
          <div>
            <button className="btn-secondary" style={{fontSize: 12, marginRight: '8px'}} onClick={resetGame}>Reiniciar</button>
            <button className="btn-primary" style={{fontSize: 12, backgroundColor: 'var(--success)'}} aria-label="Finalizar Rodada" onClick={finishRound}>Finalizar Rodada</button>
          </div>
        </h2>

        <form className="input-group" onSubmit={addLocalPlayer}>
          <input 
            type="text" 
            placeholder="Adicionar jogador presencial..." 
            value={localPlayerName}
            onChange={(e) => setLocalPlayerName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>

        <div className="ranking-list">
          {rankedPlayers.length === 0 && (
            <div style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum jogador.</div>
          )}
          {rankedPlayers.map((p, i) => {
            const isFirst = i === 0 && p.score > 0
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`
            return (
              <div key={p.id} className={`player-row ${isFirst ? 'first' : ''}`}>
                <div className="rank-pos">{medal}</div>
                <div className="player-details">
                  <div className="player-name">
                    {p.name}
                    {p.isLocal && <span className="local-badge">Local</span>}
                  </div>
                  <div className="player-score">
                    {p.displayScore} pontos
                    {roundScores[p.id] > 0 && <span style={{ color: 'var(--success)', marginLeft: 8 }}>(+{roundScores[p.id]})</span>}
                    {roundScores[p.id] < 0 && <span style={{ color: 'var(--error)', marginLeft: 8 }}>({roundScores[p.id]})</span>}
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-round" onClick={() => setCalcPlayer(p)}>+ Rodada</button>
                  <button className="btn-del" onClick={() => removePlayer(p.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {calcPlayer && (
        <ScoreKeypad 
          player={calcPlayer} 
          onConfirm={handleScoreConfirm} 
          onCancel={() => setCalcPlayer(null)} 
        />
      )}
    </div>
  )
}
