import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
  positionDelta: number;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  round: number;
  players: Player[];
};

export const db: Record<string, Room> = {};

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Conexões abertas (SSE) para cada sala
export const clients: Record<string, Response[]> = {};

export const RoomService = {
  createRoom(): Room {
    const roomId = uuidv4();
    const code = generateShortCode();
    
    const room: Room = {
      id: roomId,
      code,
      createdAt: Date.now(),
      round: 1,
      players: []
    };
    
    db[roomId] = room;
    return room;
  },
  
  getRoomByIdOrCode(idOrCode: string): Room | undefined {
    let room = db[idOrCode];
    if (!room) {
      room = Object.values(db).find(r => r.code === idOrCode) as Room;
    }
    return room;
  },
  
  updateRoomPlayers(roomId: string, players: Player[]): Room | undefined {
    if (!db[roomId]) return undefined;
    db[roomId].players = players;
    return db[roomId];
  },
  
  joinRoom(idOrCode: string, name: string): { room: Room, player: Player, isNew?: boolean } | { error: string } {
    const room = this.getRoomByIdOrCode(idOrCode);
    if (!room) {
      return { error: 'Sala não encontrada' };
    }
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { error: 'Nome é obrigatório' };
    }

    const existingPlayer = room.players.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingPlayer) {
      return { room, player: existingPlayer, isNew: false };
    }
    
    const newPlayer: Player = {
      id: uuidv4(),
      name: trimmedName,
      score: 0,
      isLocal: false,
      positionDelta: 0
    };
    
    room.players.push(newPlayer);
    return { room, player: newPlayer, isNew: true };
  },

  subscribeToRoom(roomId: string, res: Response) {
    if (!clients[roomId]) {
      clients[roomId] = [];
    }
    
    // Configura os cabeçalhos para SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    // Envia o estado atual imediatamente
    const room = db[roomId];
    if (room) {
      res.write(`data: ${JSON.stringify(room)}\n\n`);
    }

    clients[roomId].push(res);
    
    // Limpeza quando a conexão é fechada pelo cliente
    res.on('close', () => {
      console.log(`[SSE] Conexão fechada para a sala ${roomId}`);
      clients[roomId] = clients[roomId].filter(client => client !== res);
      if (clients[roomId].length === 0) {
        delete clients[roomId];
      }
    });
  },

  finishRound(roomId: string, roundScores: Record<string, number>): Room | { error: string } {
    const room = db[roomId];
    if (!room) return { error: 'Sala não encontrada' };

    const oldRanking = [...room.players].sort((a, b) => b.score - a.score);
    const oldPositions = new Map<string, number>();
    oldRanking.forEach((p, index) => oldPositions.set(p.id, index));

    room.players.forEach(p => {
      const addedScore = roundScores[p.id] || 0;
      p.score += addedScore;
    });

    const newRanking = [...room.players].sort((a, b) => b.score - a.score);
    const newPositions = new Map<string, number>();
    newRanking.forEach((p, index) => newPositions.set(p.id, index));

    room.players.forEach(p => {
      const oldPos = oldPositions.get(p.id) ?? 0;
      const newPos = newPositions.get(p.id) ?? 0;
      p.positionDelta = oldPos - newPos;
    });

    room.round += 1;
    return room;
  },

  broadcastRoomUpdate(roomId: string) {
    const room = db[roomId];
    if (!room) return;
    
    const roomClients = clients[roomId];
    if (roomClients && roomClients.length > 0) {
      const data = `data: ${JSON.stringify(room)}\n\n`;
      roomClients.forEach(res => {
        res.write(data);
      });
    }
  }
};
