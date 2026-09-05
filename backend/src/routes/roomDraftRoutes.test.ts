import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from '../index';

describe('Player Draft API', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  describe('PUT /api/rooms/:roomId/player/:playerId/draft (TI-01)', () => {
    it('deve atualizar o rascunho de pontuação do jogador e retornar 200', async () => {
      const roomRes = await request(app).post('/api/rooms').send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const joinRes = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Ana' });
      const playerId = joinRes.body.player.id;
      const draftPayload = { selectedNumbers: [2, 3], selectedBonus: [4], isMultiplierActive: true, total: 18 };
      const response = await request(app).put(`/api/rooms/${roomId}/player/${playerId}/draft`).send(draftPayload);
      expect(response.status).toBe(200);
      expect(response.body.players.find((p: any) => p.id === playerId).roundDraft).toEqual(draftPayload);
    });

    it('deve retornar 400 se o corpo do draft for inválido', async () => {
      const roomRes = await request(app).post('/api/rooms').send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const joinRes = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Ana' });
      const playerId = joinRes.body.player.id;
      const invalidPayload = { selectedNumbers: 'invalid', selectedBonus: [4], isMultiplierActive: 'yes', total: 18 };
      const response = await request(app).put(`/api/rooms/${roomId}/player/${playerId}/draft`).send(invalidPayload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Formato inválido no corpo' });
    });

    it('deve retornar 404 se a sala ou o jogador não existirem', async () => {
      const draftPayload = { selectedNumbers: [2], selectedBonus: [], isMultiplierActive: false, total: 2 };
      const resInvalidRoom = await request(app).put('/api/rooms/invalid-room/player/p1/draft').send(draftPayload);
      expect(resInvalidRoom.status).toBe(404);
      const roomRes = await request(app).post('/api/rooms').send({ controllerName: 'Admin', isControllerPlaying: true });
      const resInvalidPlayer = await request(app).put(`/api/rooms/${roomRes.body.id}/player/invalid-player/draft`).send(draftPayload);
      expect(resInvalidPlayer.status).toBe(404);
    });
  });

  describe('Sequência de atualização de draft e finalização de rodada (TI-02)', () => {
    it('deve atualizar draft sequencialmente e consolidar no finishRound', async () => {
      const roomRes = await request(app).post('/api/rooms').send({ controllerName: 'Admin', isControllerPlaying: true });
      const roomId = roomRes.body.id;
      const joinP1 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'P1' });
      const joinP2 = await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'P2' });
      const p1Id = joinP1.body.player.id;
      const p2Id = joinP2.body.player.id;

      await request(app).put(`/api/rooms/${roomId}/player/${p1Id}/draft`).send({ selectedNumbers: [10], selectedBonus: [], isMultiplierActive: false, total: 20 });
      await request(app).put(`/api/rooms/${roomId}/player/${p1Id}/draft`).send({ selectedNumbers: [10, 5], selectedBonus: [10], isMultiplierActive: true, total: 45 });
      await request(app).put(`/api/rooms/${roomId}/player/${p2Id}/draft`).send({ selectedNumbers: [5, 5], selectedBonus: [], isMultiplierActive: false, total: 10 });
      const finishRes = await request(app).post(`/api/rooms/${roomId}/round/finish`).send({});

      expect(finishRes.status).toBe(200);
      expect(finishRes.body.round).toBe(2);
      expect(finishRes.body.players.find((p: any) => p.id === p1Id).score).toBe(45);
      expect(finishRes.body.players.find((p: any) => p.id === p2Id).score).toBe(10);
      expect(finishRes.body.players.find((p: any) => p.id === p1Id).roundDraft).toBeUndefined();
      expect(finishRes.body.players.find((p: any) => p.id === p2Id).roundDraft).toBeUndefined();
    });
  });
});
