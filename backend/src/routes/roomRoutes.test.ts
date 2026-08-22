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
});
