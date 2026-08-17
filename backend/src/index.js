const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para registrar requisições (logs em tempo real)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const PORT = process.env.PORT || 3000;

// Simulação de banco de dados em memória
// Estrutura:
// {
//   "roomId": {
//     id: string,
//     code: string,
//     createdAt: number,
//     players: [ { id: string, name: string, score: number, isLocal: boolean } ]
//   }
// }
const db = {};

// Função auxiliar para gerar um código curto (ex: "A4B2")
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. Criar uma nova sala (Controlador)
app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4();
  const code = generateShortCode();
  
  db[roomId] = {
    id: roomId,
    code: code,
    createdAt: Date.now(),
    players: [] // Inicialmente sem jogadores
  };
  
  res.status(201).json(db[roomId]);
});

// 2. Obter estado atual da sala (Visualizadores & Controlador fazem polling)
// Pode buscar pelo roomId (uuid) ou pelo code (4 letras)
app.get('/api/rooms/:idOrCode', (req, res) => {
  const idOrCode = req.params.idOrCode;
  
  // Buscar a sala
  let room = db[idOrCode];
  if (!room) {
    room = Object.values(db).find(r => r.code === idOrCode);
  }
  
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  res.json(room);
});

// 3. Atualizar estado da sala (Controlador salva pontuações)
app.put('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { players } = req.body;
  
  if (!db[roomId]) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  // O Controlador envia o array completo de jogadores atualizado
  db[roomId].players = players;
  
  res.json(db[roomId]);
});

// 4. Ingressar em uma sala (Visualizador adicionando seu nome)
app.post('/api/rooms/:idOrCode/join', (req, res) => {
  const { idOrCode } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  // Buscar a sala
  let room = db[idOrCode];
  if (!room) {
    room = Object.values(db).find(r => r.code === idOrCode);
  }
  
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  // Verificar se já existe um jogador com esse nome na sala
  const existingPlayer = room.players.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
  
  if (existingPlayer) {
    // Se o jogador já existe, apenas o retorna (útil caso tenha saído e voltado)
    return res.json({ room, player: existingPlayer });
  }
  
  // Adiciona novo jogador
  const newPlayer = {
    id: uuidv4(),
    name: name.trim(),
    score: 0,
    isLocal: false // False pois é um visualizador que entrou via smartphone
  };
  
  room.players.push(newPlayer);
  
  res.status(201).json({ room, player: newPlayer });
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
