import { Room, Player } from '../../types';

export async function createRoom(): Promise<Room> {
  const res = await fetch('/api/rooms', { method: 'POST' });
  if (!res.ok) throw new Error('Erro ao criar sala');
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

export async function finishRound(roomId: string, roundScores: Record<string, number>): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}/round/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roundScores })
  });
  if (!res.ok) throw new Error('Erro ao finalizar rodada');
  return res.json();
}
