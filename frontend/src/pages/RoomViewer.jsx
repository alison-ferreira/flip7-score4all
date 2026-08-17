import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function RoomViewer() {
  const { code } = useParams()
  const [room, setRoom] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  // Polling loop
  useEffect(() => {
    if (!hasJoined) return

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
  }, [code, hasJoined])

  const handleJoin = async (e) => {
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
    } catch (e) {
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

  if (!room) return <div className="container"><p>Carregando sala...</p></div>

  const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score)

  return (
    <div className="container">
      <header className="room-header">
        <h1>Ranking</h1>
        <div className="room-code">SALA: {room.code}</div>
      </header>

      <div className="panel">
        <div className="ranking-list">
          {rankedPlayers.length === 0 ? (
            <div style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum jogador na sala ainda.</div>
          ) : (
            rankedPlayers.map((p, i) => {
              const isFirst = i === 0 && p.score > 0
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`
              return (
                <div key={p.id} className={`player-row ${isFirst ? 'first' : ''}`}>
                  <div className="rank-pos">{medal}</div>
                  <div className="player-details">
                    <div className="player-name">
                      {p.name}
                      {p.name.toLowerCase() === playerName.toLowerCase() && <span className="local-badge" style={{background: 'var(--accent)', color: '#000'}}>Você</span>}
                    </div>
                    <div className="player-score">{p.score} pontos</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
