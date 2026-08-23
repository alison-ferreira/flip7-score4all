import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from '../index';

describe('POST /api/rooms/:roomId/round/finish', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('deve retornar 400 se roundScores for fornecido com tipo inválido', async () => {
    const createResponse = await request(app).post('/api/rooms');
    const { id } = createResponse.body;
    const response = await request(app).post(`/api/rooms/${id}/round/finish`).send({ roundScores: 'invalid' });
    expect(response.status).toBe(400);
  });

  it('TI-01: deve finalizar a rodada, atualizar pontos e posições', async () => {
    const createResponse = await request(app).post('/api/rooms');
    const { id } = createResponse.body;
    await request(app).post(`/api/rooms/${id}/join`).send({ name: 'P1' });
    await request(app).post(`/api/rooms/${id}/join`).send({ name: 'P2' });

    const roomState = await request(app).get(`/api/rooms/${id}`);
    const p1Id = roomState.body.players.find((p: any) => p.name === 'P1').id;
    const p2Id = roomState.body.players.find((p: any) => p.name === 'P2').id;

    const roundScores = { [p1Id]: 50, [p2Id]: 20 };
    const response = await request(app).post(`/api/rooms/${id}/round/finish`).send({ roundScores });

    expect(response.status).toBe(200);
    expect(response.body.round).toBe(2);
    const updatedP1 = response.body.players.find((p: any) => p.id === p1Id);
    const updatedP2 = response.body.players.find((p: any) => p.id === p2Id);
    expect(updatedP1.score).toBe(50);
    expect(updatedP2.score).toBe(20);
    expect(updatedP1.positionDelta).toBe(0);
    expect(updatedP2.positionDelta).toBe(0);
  });
});
