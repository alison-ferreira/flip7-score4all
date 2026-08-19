"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importStar(require("./index"));
(0, vitest_1.describe)('Room Controller API', () => {
    (0, vitest_1.beforeEach)(() => {
        // Limpa o banco de dados antes de cada teste
        Object.keys(index_1.db).forEach(key => delete index_1.db[key]);
    });
    (0, vitest_1.describe)('GET /health', () => {
        (0, vitest_1.it)('deve retornar status ok', async () => {
            const response = await (0, supertest_1.default)(index_1.default).get('/health');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual({ status: 'ok' });
        });
    });
    (0, vitest_1.describe)('POST /api/rooms', () => {
        (0, vitest_1.it)('deve criar uma nova sala', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body).toHaveProperty('id');
            (0, vitest_1.expect)(response.body).toHaveProperty('code');
            (0, vitest_1.expect)(response.body.code.length).toBe(4);
            (0, vitest_1.expect)(response.body.players).toEqual([]);
            // Verifica se está no banco
            (0, vitest_1.expect)(index_1.db[response.body.id]).toBeDefined();
        });
    });
    (0, vitest_1.describe)('GET /api/rooms/:idOrCode', () => {
        (0, vitest_1.it)('deve retornar 404 se a sala nao existir', async () => {
            const response = await (0, supertest_1.default)(index_1.default).get('/api/rooms/invalid');
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('deve retornar a sala pelo id', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { id } = createResponse.body;
            const response = await (0, supertest_1.default)(index_1.default).get(`/api/rooms/${id}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.id).toBe(id);
        });
        (0, vitest_1.it)('deve retornar a sala pelo codigo', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { code } = createResponse.body;
            const response = await (0, supertest_1.default)(index_1.default).get(`/api/rooms/${code}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.code).toBe(code);
        });
    });
    (0, vitest_1.describe)('PUT /api/rooms/:roomId', () => {
        (0, vitest_1.it)('deve retornar 404 se a sala nao existir', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put('/api/rooms/invalid')
                .send({ players: [] });
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('deve atualizar os jogadores da sala', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { id } = createResponse.body;
            const newPlayers = [{ id: '1', name: 'Ana', score: 10, isLocal: true }];
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/rooms/${id}`)
                .send({ players: newPlayers });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.players).toEqual(newPlayers);
            (0, vitest_1.expect)(index_1.db[id].players).toEqual(newPlayers);
        });
    });
    (0, vitest_1.describe)('POST /api/rooms/:idOrCode/join', () => {
        (0, vitest_1.it)('deve retornar 400 se nome nao for fornecido', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { id } = createResponse.body;
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/rooms/${id}/join`)
                .send({});
            (0, vitest_1.expect)(response.status).toBe(400);
        });
        (0, vitest_1.it)('deve retornar 404 se a sala nao existir', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/rooms/invalid/join')
                .send({ name: 'Ana' });
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('deve permitir que um novo jogador entre na sala', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { id } = createResponse.body;
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/rooms/${id}/join`)
                .send({ name: 'Ana' });
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body.player.name).toBe('Ana');
            (0, vitest_1.expect)(response.body.room.players).toHaveLength(1);
        });
        (0, vitest_1.it)('deve retornar jogador existente se entrar novamente com o mesmo nome', async () => {
            const createResponse = await (0, supertest_1.default)(index_1.default).post('/api/rooms');
            const { id } = createResponse.body;
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/rooms/${id}/join`)
                .send({ name: 'Ana' });
            const response2 = await (0, supertest_1.default)(index_1.default)
                .post(`/api/rooms/${id}/join`)
                .send({ name: 'Ana' });
            (0, vitest_1.expect)(response2.status).toBe(200);
            (0, vitest_1.expect)(response2.body.player.name).toBe('Ana');
            (0, vitest_1.expect)(response2.body.room.players).toHaveLength(1);
        });
    });
});
