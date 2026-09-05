import { Room, Player, PlayerStatus, PlayerRoundDraft, CreateRoomInput, ResetGameInput } from '../../types';

export async function createRoom(input?: CreateRoomInput): Promise<Room> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: input ? JSON.stringify(input) : undefined
  });
  if (!res.ok) throw new Error('Erro ao criar sala');
  return res.json();
}

export async function resetGame(roomId: string, input: ResetGameInput): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Erro ao reiniciar partida');
  return res.json();
}

export async function saveRoomState(roomId: string, players: Player[]): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players })
  });
  if (!res.ok) throw new Error('Erro ao atualizar sala');
  return res.json();
}

export async function joinRoom(code: string, name: string): Promise<{ room: Room; player: Player }> {
  const res = await fetch(`/api/rooms/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Erro ao entrar na sala');
  return res.json();
}

export async function finishRound(roomId: string, roundScores?: Record<string, number>): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/round/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: roundScores ? JSON.stringify({ roundScores }) : JSON.stringify({})
  });
  if (!res.ok) throw new Error('Erro ao finalizar rodada');
  return res.json();
}

export async function updatePlayerStatus(roomId: string, playerId: string, status: PlayerStatus): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/player/${playerId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erro ao atualizar status do jogador');
  return res.json();
}

export async function setDealer(roomId: string, playerId: string): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/dealer/${playerId}`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Erro ao definir dealer');
  return res.json();
}

export async function updatePlayerDraft(roomId: string, playerId: string, draft: PlayerRoundDraft): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/player/${playerId}/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft)
  });
  if (!res.ok) throw new Error('Erro ao atualizar rascunho do jogador');
  return res.json();
}


