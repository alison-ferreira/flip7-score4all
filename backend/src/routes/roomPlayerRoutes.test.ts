import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from '../index';

describe('Player Status and Dealer API', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  describe('PUT /api/rooms/:roomId/player/:playerId/status', () => {
    it('deve atualizar o status do jogador e retornar 200', async () => {
      const roomRes = await request(app)
        .post('/api/rooms')
        .send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const joinRes = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Alison' });
      const playerId = joinRes.body.player.id;
      const res = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({ status: 'stopped' });
      expect(res.status).toBe(200);
      expect(res.body.players.find((p: any) => p.id === playerId).status).toBe('stopped');
    });

    it('deve retornar 400 se o status for inválido ou ausente', async () => {
      const roomRes = await request(app)
        .post('/api/rooms')
        .send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const joinRes = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Alison' });
      const playerId = joinRes.body.player.id;
      const resEmpty = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({});
      expect(resEmpty.status).toBe(400);
      const resInvalid = await request(app)
        .put(`/api/rooms/${roomId}/player/${playerId}/status`)
        .send({ status: 'invalid_status' });
      expect(resInvalid.status).toBe(400);
    });

    it('deve retornar 404 se a sala ou o jogador não existirem', async () => {
      const resRoom404 = await request(app)
        .put('/api/rooms/invalid-room/player/invalid-p/status')
        .send({ status: 'stopped' });
      expect(resRoom404.status).toBe(404);
      const roomRes = await request(app)
        .post('/api/rooms')
        .send({ controllerName: 'Admin', isControllerPlaying: true });
      const resPlayer404 = await request(app)
        .put(`/api/rooms/${roomRes.body.id}/player/invalid-p/status`)
        .send({ status: 'stopped' });
      expect(resPlayer404.status).toBe(404);
    });
  });

  describe('PUT /api/rooms/:roomId/dealer/:playerId', () => {
    it('deve definir o dealer com sucesso e atualizar os demais jogadores', async () => {
      const roomRes = await request(app)
        .post('/api/rooms')
        .send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const join1 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'P1' });
      const join2 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'P2' });
      const p1Id = join1.body.player.id;
      const p2Id = join2.body.player.id;
      const res1 = await request(app).put(`/api/rooms/${roomId}/dealer/${p1Id}`);
      expect(res1.status).toBe(200);
      expect(res1.body.players.find((p: any) => p.id === p1Id).isDealer).toBe(true);
      expect(res1.body.players.find((p: any) => p.id === p2Id).isDealer).toBe(false);
      const res2 = await request(app).put(`/api/rooms/${roomId}/dealer/${p2Id}`);
      expect(res2.status).toBe(200);
      expect(res2.body.players.find((p: any) => p.id === p1Id).isDealer).toBe(false);
      expect(res2.body.players.find((p: any) => p.id === p2Id).isDealer).toBe(true);
    });

    it('deve retornar 404 se a sala ou o jogador não existirem', async () => {
      const resRoom404 = await request(app).put('/api/rooms/invalid-room/dealer/invalid-p');
      expect(resRoom404.status).toBe(404);
      const roomRes = await request(app)
        .post('/api/rooms')
        .send({ controllerName: 'Admin', isControllerPlaying: true });
      const resPlayer404 = await request(app).put(`/api/rooms/${roomRes.body.id}/dealer/invalid-p`);
      expect(resPlayer404.status).toBe(404);
    });
  });
});
