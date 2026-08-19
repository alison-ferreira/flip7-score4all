import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createRoom = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', { method: 'POST' })
      const room = await res.json()
      navigate(`/room/${room.code}/controller`)
    } catch {
      alert('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    navigate(`/room/${joinCode.toUpperCase()}`)
  }

  return (
    <div className="container">
      <header>
        <h1>Flip7 Score4All</h1>
      </header>
      
      <div className="panel">
        <h2 style={{justifyContent: 'center', marginBottom: 0}}>Controlador</h2>
        <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px'}}>
          Crie uma nova sala para gerenciar a pontuação.
        </p>
        <button 
          className="btn-primary" 
          onClick={createRoom} 
          disabled={loading}
          style={{marginTop: 10}}
        >
          {loading ? 'Criando...' : 'Criar Nova Sala'}
        </button>
      </div>

      <div className="panel" style={{marginTop: 20}}>
        <h2 style={{justifyContent: 'center', marginBottom: 0}}>Visualizador</h2>
        <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px'}}>
          Entre em uma sala existente para acompanhar o placar.
        </p>
        <form onSubmit={joinRoom} className="input-group" style={{marginTop: 10}}>
          <input 
            type="text" 
            placeholder="Ex: A4B2" 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            required
            style={{textAlign: 'center', textTransform: 'uppercase'}}
          />
          <button type="submit" className="btn-accent">Entrar</button>
        </form>
      </div>
    </div>
  )
}
