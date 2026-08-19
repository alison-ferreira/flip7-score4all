import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ScoreKeypad from '../components/ScoreKeypad'
import { Room, Player } from '../types'

export default function RoomController() {
  const { code } = useParams<{ code: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [localPlayerName, setLocalPlayerName] = useState('')
  const [calcPlayer, setCalcPlayer] = useState<Player | null>(null)

  // Polling loop to get new remote players
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`)
        if (res.ok) {
          const data = await res.json()
          setRoom(data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchRoom()
    const interval = setInterval(fetchRoom, 2000)
    return () => clearInterval(interval)
  }, [code])

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
    if (calcPlayer && room) {
      const updatedPlayers = room.players.map(p => {
        if (p.id === calcPlayer.id) {
          return { ...p, score: p.score + points }
        }
        return p
      })
      saveRoomState(updatedPlayers)
    }
    setCalcPlayer(null) // Fecha o modal
  }

  if (!room) return <div className="container"><p style={{ textAlign: 'center', width: '100%' }}>Carregando sala...</p></div>

  const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score)

  return (
    <div className="container">
      <header className="room-header">
        <h1>Controlador</h1>
        <div className="room-code">SALA: {room.code}</div>
      </header>

      <div className="panel">
        <h2>
          Ranking & Ações
          <button className="btn-secondary" style={{fontSize: 12}} onClick={resetGame}>Reiniciar Jogo</button>
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
                  <div className="player-score">{p.score} pontos</div>
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
