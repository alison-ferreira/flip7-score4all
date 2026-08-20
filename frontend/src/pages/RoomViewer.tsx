import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRoomSync } from '../hooks/useRoomSync'
import { motion, AnimatePresence } from 'framer-motion'

function DeltaIndicator({ delta }: { delta?: number }) {
  if (delta === undefined) return null;

  if (delta > 0) {
    return (
      <span aria-label={`Subiu ${delta} posições no ranking`} style={{ color: 'var(--success)', marginLeft: '8px', fontSize: '1.2em' }}>
        ⬆️ {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span aria-label={`Caiu ${Math.abs(delta)} posições no ranking`} style={{ color: 'var(--danger)', marginLeft: '8px', fontSize: '1.2em' }}>
        ⬇️ {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span aria-label="Manteve posição" style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '1.2em' }}>
      ➖
    </span>
  );
}

export default function RoomViewer() {
  const { code } = useParams<{ code: string }>()
  const [playerName, setPlayerName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const { room, setRoom } = useRoomSync(code, hasJoined)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim()) return
    setLoading(true)

    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName })
      })

      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
        setHasJoined(true)
      } else {
        alert('Sala não encontrada.')
      }
    } catch {
      alert('Erro ao entrar na sala.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasJoined) {
    return (
      <div className="container">
        <header>
          <h1>Flip7 Score4All</h1>
        </header>
        <div className="panel">
          <h2 style={{justifyContent: 'center'}}>Entrar na Sala {code}</h2>
          <form onSubmit={handleJoin} className="input-group">
            <input 
              type="text" 
              placeholder="Seu Nome" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!room) return <div className="container"><p style={{ textAlign: 'center', width: '100%' }}>Carregando sala...</p></div>

  const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score)

  return (
    <div className="container">
      <header className="room-header" style={{ flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h1>Ranking</h1>
          <div className="room-code">SALA: {room.code}</div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
          Rodada {room.round}
        </div>
      </header>

      <div className="panel">
        <div className="ranking-list">
          {rankedPlayers.length === 0 ? (
            <div style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum jogador na sala ainda.</div>
          ) : (
            <AnimatePresence>
              {rankedPlayers.map((p, i) => {
                const isFirst = i === 0 && p.score > 0
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`
                return (
                  <motion.div 
                    key={p.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`player-row ${isFirst ? 'first' : ''}`}
                  >
                    <div className="rank-pos">{medal}</div>
                    <div className="player-details">
                      <div className="player-name">
                        {p.name}
                        {p.name.toLowerCase() === playerName.toLowerCase() && <span className="local-badge" style={{background: 'var(--accent)', color: '#000'}}>Você</span>}
                      </div>
                      <div className="player-score">{p.score} pontos</div>
                    </div>
                    <DeltaIndicator delta={p.positionDelta} />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
