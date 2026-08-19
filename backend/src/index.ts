import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para registrar requisições (logs em tempo real)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const PORT = process.env.PORT || 3000;

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
};

export type Room = {
  id: string;
  code: string;
  createdAt: number;
  players: Player[];
};

// Simulação de banco de dados em memória
export const db: Record<string, Room> = {};

// Função auxiliar para gerar um código curto (ex: "A4B2")
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 1. Criar uma nova sala (Controlador)
app.post('/api/rooms', (_req: Request, res: Response) => {
  const roomId = uuidv4();
  const code = generateShortCode();
  
  db[roomId] = {
    id: roomId,
    code: code,
    createdAt: Date.now(),
    players: []
  };
  
  res.status(201).json(db[roomId]);
});

// 2. Obter estado atual da sala (Visualizadores & Controlador fazem polling)
app.get('/api/rooms/:idOrCode', (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode as string;
  
  let room = db[idOrCode];
  if (!room) {
    room = Object.values(db).find(r => r.code === idOrCode) as Room;
  }
  
  if (!room) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  res.json(room);
});

// 3. Atualizar estado da sala (Controlador salva pontuações)
app.put('/api/rooms/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId as string;
  const { players } = req.body;
  
  if (!db[roomId]) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  db[roomId].players = players;
  
  res.json(db[roomId]);
});

// 4. Ingressar em uma sala (Visualizador adicionando seu nome)
app.post('/api/rooms/:idOrCode/join', (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode as string;
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'Nome é obrigatório' });
    return;
  }

  let room = db[idOrCode];
  if (!room) {
    room = Object.values(db).find(r => r.code === idOrCode) as Room;
  }
  
  if (!room) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  const trimmedName = name.trim();
  const existingPlayer = room.players.find((p: Player) => p.name.toLowerCase() === trimmedName.toLowerCase());
  
  if (existingPlayer) {
    res.json({ room, player: existingPlayer });
    return;
  }
  
  const newPlayer: Player = {
    id: uuidv4(),
    name: trimmedName,
    score: 0,
    isLocal: false
  };
  
  room.players.push(newPlayer);
  
  res.status(201).json({ room, player: newPlayer });
});

// Não inicia o servidor automaticamente quando é importado por arquivos de teste
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
  });
}

export default app;
