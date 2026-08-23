import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from '../index';

describe('Room Controller API', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
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
      expect(db[response.body.id]).toBeDefined();
    });
  });

  describe('GET /api/rooms/:idOrCode', () => {
    it('deve retornar 404 se a sala nao existir', async () => {
      const response = await request(app).get('/api/rooms/invalid');
      expect(response.status).toBe(404);
    });

    it('deve retornar a sala pelo id e pelo código', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id, code } = createResponse.body;
      const resById = await request(app).get(`/api/rooms/${id}`);
      expect(resById.status).toBe(200);
      expect(resById.body.id).toBe(id);
      const resByCode = await request(app).get(`/api/rooms/${code}`);
      expect(resByCode.status).toBe(200);
      expect(resByCode.body.code).toBe(code);
    });
  });

  describe('PUT /api/rooms/:roomId', () => {
    it('deve atualizar os jogadores da sala ou retornar 404', async () => {
      const res404 = await request(app).put('/api/rooms/invalid').send({ players: [] });
      expect(res404.status).toBe(404);
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;
      const newPlayers = [{ id: '1', name: 'Ana', score: 10, isLocal: true, positionDelta: 0 }];
      const response = await request(app).put(`/api/rooms/${id}`).send({ players: newPlayers });
      expect(response.status).toBe(200);
      expect(response.body.players).toEqual(newPlayers);
    });
  });

  describe('POST /api/rooms/:idOrCode/join', () => {
    it('deve validar entrada e registrar jogador', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id } = createResponse.body;
      const res400 = await request(app).post(`/api/rooms/${id}/join`).send({});
      expect(res400.status).toBe(400);
      const res404 = await request(app).post('/api/rooms/invalid/join').send({ name: 'Ana' });
      expect(res404.status).toBe(404);
      const res201 = await request(app).post(`/api/rooms/${id}/join`).send({ name: 'Ana' });
      expect(res201.status).toBe(201);
      expect(res201.body.player.name).toBe('Ana');
      const res200 = await request(app).post(`/api/rooms/${id}/join`).send({ name: 'Ana' });
      expect(res200.status).toBe(200);
    });
  });

  describe('PUT /api/rooms/:roomId/player/:playerId/status (TI-01)', () => {
    it('deve atualizar o status do jogador e retornar 200', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id: roomId } = createResponse.body;
      const joinResponse = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Alison' });
      const playerId = joinResponse.body.player.id;

      const res = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({ status: 'stopped' });

      expect(res.status).toBe(200);
      expect(res.body.players[0].status).toBe('stopped');
    });

    it('deve retornar 400 se o status for invalido ou ausente', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id: roomId } = createResponse.body;
      const joinResponse = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Alison' });
      const playerId = joinResponse.body.player.id;

      const resEmpty = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({});
      expect(resEmpty.status).toBe(400);

      const resInvalid = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({ status: 'invalid_status' });
      expect(resInvalid.status).toBe(400);
    });

    it('deve retornar 404 se a sala ou o jogador nao existirem', async () => {
      const resRoom404 = await request(app)
        .put('/api/rooms/invalid-room/player/invalid-player/status')
        .send({ status: 'stopped' });
      expect(resRoom404.status).toBe(404);

      const createResponse = await request(app).post('/api/rooms');
      const { id: roomId } = createResponse.body;
      const resPlayer404 = await request(app)
        .put(`/api/rooms/${roomId}/player/invalid-player/status`)
        .send({ status: 'stopped' });
      expect(resPlayer404.status).toBe(404);
    });
  });

  describe('PUT /api/rooms/:roomId/dealer/:playerId (TI-02)', () => {
    it('deve definir o dealer com sucesso e atualizar os demais jogadores', async () => {
      const createResponse = await request(app).post('/api/rooms');
      const { id: roomId } = createResponse.body;
      const join1 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Player1' });
      const join2 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Player2' });

      const p1Id = join1.body.player.id;
      const p2Id = join2.body.player.id;

      const res1 = await request(app).put(`/api/rooms/${roomId}/dealer/${p1Id}`);
      expect(res1.status).toBe(200);
      expect(res1.body.players.find((p: { id: string }) => p.id === p1Id).isDealer).toBe(true);
      expect(res1.body.players.find((p: { id: string }) => p.id === p2Id).isDealer).toBe(false);

      const res2 = await request(app).put(`/api/rooms/${roomId}/dealer/${p2Id}`);
      expect(res2.status).toBe(200);
      expect(res2.body.players.find((p: { id: string }) => p.id === p1Id).isDealer).toBe(false);
      expect(res2.body.players.find((p: { id: string }) => p.id === p2Id).isDealer).toBe(true);
    });

    it('deve retornar 404 se a sala ou o jogador nao existirem', async () => {
      const resRoom404 = await request(app).put('/api/rooms/invalid-room/dealer/invalid-player');
      expect(resRoom404.status).toBe(404);

      const createResponse = await request(app).post('/api/rooms');
      const { id: roomId } = createResponse.body;
      const resPlayer404 = await request(app).put(`/api/rooms/${roomId}/dealer/invalid-player`);
      expect(resPlayer404.status).toBe(404);
    });
  });
});
