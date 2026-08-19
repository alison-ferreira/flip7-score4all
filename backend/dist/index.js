"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
exports.db = {};
// Função auxiliar para gerar um código curto (ex: "A4B2")
function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// 1. Criar uma nova sala (Controlador)
app.post('/api/rooms', (_req, res) => {
    const roomId = (0, uuid_1.v4)();
    const code = generateShortCode();
    exports.db[roomId] = {
        id: roomId,
        code: code,
        createdAt: Date.now(),
        players: []
    };
    res.status(201).json(exports.db[roomId]);
});
// 2. Obter estado atual da sala (Visualizadores & Controlador fazem polling)
app.get('/api/rooms/:idOrCode', (req, res) => {
    const idOrCode = req.params.idOrCode;
    let room = exports.db[idOrCode];
    if (!room) {
        room = Object.values(exports.db).find(r => r.code === idOrCode);
    }
    if (!room) {
        res.status(404).json({ error: 'Sala não encontrada' });
        return;
    }
    res.json(room);
});
// 3. Atualizar estado da sala (Controlador salva pontuações)
app.put('/api/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const { players } = req.body;
    if (!exports.db[roomId]) {
        res.status(404).json({ error: 'Sala não encontrada' });
        return;
    }
    exports.db[roomId].players = players;
    res.json(exports.db[roomId]);
});
// 4. Ingressar em uma sala (Visualizador adicionando seu nome)
app.post('/api/rooms/:idOrCode/join', (req, res) => {
    const idOrCode = req.params.idOrCode;
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Nome é obrigatório' });
        return;
    }
    let room = exports.db[idOrCode];
    if (!room) {
        room = Object.values(exports.db).find(r => r.code === idOrCode);
    }
    if (!room) {
        res.status(404).json({ error: 'Sala não encontrada' });
        return;
    }
    const trimmedName = name.trim();
    const existingPlayer = room.players.find((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingPlayer) {
        res.json({ room, player: existingPlayer });
        return;
    }
    const newPlayer = {
        id: (0, uuid_1.v4)(),
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
exports.default = app;
