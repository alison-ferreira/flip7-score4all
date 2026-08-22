import { Response } from 'express';
import { db } from './roomService';

export const clients: Record<string, Response[]> = {};

export function subscribeToRoom(roomId: string, res: Response): void {
  if (!clients[roomId]) {
    clients[roomId] = [];
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  const room = db[roomId];
  if (room) {
    res.write(`data: ${JSON.stringify(room)}\n\n`);
  }
  clients[roomId].push(res);
  res.on('close', () => {
    clients[roomId] = clients[roomId].filter(client => client !== res);
    if (clients[roomId].length === 0) {
      delete clients[roomId];
    }
  });
}

export function broadcastRoomUpdate(roomId: string): void {
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
