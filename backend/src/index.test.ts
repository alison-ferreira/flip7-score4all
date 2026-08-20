import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from './index';

describe('Room Controller API', () => {
  beforeEach(() => {
    // Limpa o banco de dados antes de cada teste
    Object.keys(db).forEach(key => delete db[key]);
  });

  describe('GET /health', () => {
    it('deve retornar status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/rooms', () => {
    it('deve criar uma nova sala', async () => {
      const response = await request(app).post('/api/rooms');
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('code');
      expect(response.body.code.length).toBe(4);
      expect(response.body.players).toEqual([]);
      
      // Verifica se está no banco
      expect(db[response.body.id]).toBeDefined();
    });
  });

  describe('GET /api/rooms/:idOrCode', () => {
    it('deve retornar 404 se a sala nao existir', async () => {
      const response = await request(app).get('/api/rooms/invalid');
      expect(response.status).toBe(404);
    });

    it('deve retornar a sala pelo id', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      const response = await request(app).get(`/api/rooms/${id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
    });

    it('deve retornar a sala pelo codigo', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { code } = createResponse.body;

      const response = await request(app).get(`/api/rooms/${code}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(code);
    });
  });

  describe('PUT /api/rooms/:roomId', () => {
    it('deve retornar 404 se a sala nao existir', async () => {
      const response = await request(app)
        .put('/api/rooms/invalid')
        .send({ players: [] });
      expect(response.status).toBe(404);
    });

    it('deve atualizar os jogadores da sala', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      const newPlayers = [{ id: '1', name: 'Ana', score: 10, isLocal: true }];
      
      const response = await request(app)
        .put(`/api/rooms/${id}`)
        .send({ players: newPlayers });
        
      expect(response.status).toBe(200);
      expect(response.body.players).toEqual(newPlayers);
      expect(db[id].players).toEqual(newPlayers);
    });
  });

  describe('POST /api/rooms/:idOrCode/join', () => {
    it('deve retornar 400 se nome nao for fornecido', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      const response = await request(app)
        .post(`/api/rooms/${id}/join`)
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('deve retornar 404 se a sala nao existir', async () => {
      const response = await request(app)
        .post('/api/rooms/invalid/join')
        .send({ name: 'Ana' });
      expect(response.status).toBe(404);
    });

    it('deve permitir que um novo jogador entre na sala', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      const response = await request(app)
        .post(`/api/rooms/${id}/join`)
        .send({ name: 'Ana' });
        
      expect(response.status).toBe(201);
      expect(response.body.player.name).toBe('Ana');
      expect(response.body.room.players).toHaveLength(1);
    });

    it('deve retornar jogador existente se entrar novamente com o mesmo nome', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      await request(app)
        .post(`/api/rooms/${id}/join`)
        .send({ name: 'Ana' });
        
      const response2 = await request(app)
        .post(`/api/rooms/${id}/join`)
        .send({ name: 'Ana' });
        
      expect(response2.status).toBe(200);
      expect(response2.body.player.name).toBe('Ana');
      expect(response2.body.room.players).toHaveLength(1);
    });
  });

  describe('POST /api/rooms/:roomId/round/finish', () => {
    it('deve retornar 400 se roundScores não for fornecido', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      const response = await request(app)
        .post(`/api/rooms/${id}/round/finish`)
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('TI-01: deve finalizar a rodada, atualizar pontos e posições', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;

      // Join 2 players
      await request(app).post(`/api/rooms/${id}/join`).send({ name: 'P1' });
      await request(app).post(`/api/rooms/${id}/join`).send({ name: 'P2' });

      // We need to fetch their IDs
      const roomState = await request(app).get(`/api/rooms/${id}`);
      const p1Id = roomState.body.players.find((p: any) => p.name === 'P1').id;
      const p2Id = roomState.body.players.find((p: any) => p.name === 'P2').id;

      // Finish round
      const roundScores = {
        [p1Id]: 50,
        [p2Id]: 20
      };

      const response = await request(app)
        .post(`/api/rooms/${id}/round/finish`)
        .send({ roundScores });

      expect(response.status).toBe(200);
      expect(response.body.round).toBe(2); // Was 1 initially
      
      const updatedP1 = response.body.players.find((p: any) => p.id === p1Id);
      const updatedP2 = response.body.players.find((p: any) => p.id === p2Id);

      expect(updatedP1.score).toBe(50);
      expect(updatedP2.score).toBe(20);

      // P1 has 50 (index 0), P2 has 20 (index 1) - Wait, sort is descending (50 vs 20).
      // They both started with 0 (index 0 for P1, 1 for P2).
      // Now P1 is 1st (index 0), P2 is 2nd (index 1).
      // Deltas should be 0.
      expect(updatedP1.positionDelta).toBe(0);
      expect(updatedP2.positionDelta).toBe(0);
    });
  });
});
