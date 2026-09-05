import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { db } from '../index';

describe('Room Controller API (TI-01 a TI-04)', () => {
  beforeEach(() => {
    Object.keys(db).forEach((key) => delete db[key]);
  });

  it('GET /health deve retornar status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('TI-01: POST /api/rooms com body válido retorna 201 com controlador', async () => {
    const res = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: true });
    expect(res.status).toBe(201);
    expect(res.body.controllerName).toBe('Ana');
    expect(res.body.isControllerPlaying).toBe(true);
    expect(res.body.controllerPlayerId).toBeDefined();
    expect(res.body.players[0].isController).toBe(true);
    expect(db[res.body.id]).toBeDefined();
  });

  it('TI-02: POST /api/rooms sem nome retorna 400', async () => {
    const empty = await request(app).post('/api/rooms').send({ controllerName: '', isControllerPlaying: true });
    expect(empty.status).toBe(400);
    const noBody = await request(app).post('/api/rooms').send({});
    expect(noBody.status).toBe(400);
    const invalidType = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: 'yes' });
    expect(invalidType.status).toBe(400);
  });

  it('TI-03: POST /api/rooms/:roomId/reset retorna sala reiniciada', async () => {
    const createRes = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: true });
    const roomId = createRes.body.id;
    await request(app).post(`/api/rooms/${roomId}/join`).send({ name: 'Beto' });
    const resetRes = await request(app).post(`/api/rooms/${roomId}/reset`).send({ isControllerPlaying: false });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.round).toBe(1);
    expect(resetRes.body.isControllerPlaying).toBe(false);
    expect(resetRes.body.controllerPlayerId).toBeNull();
    const lastPlayer = resetRes.body.players[resetRes.body.players.length - 1];
    expect(lastPlayer.isController).toBe(true);
    expect(lastPlayer.status).toBeUndefined();
    const notFound = await request(app).post('/api/rooms/invalid-id/reset').send({ isControllerPlaying: true });
    expect(notFound.status).toBe(404);
    const invalidReset = await request(app).post(`/api/rooms/${roomId}/reset`).send({ isControllerPlaying: 'yes' });
    expect(invalidReset.status).toBe(400);
  });

  it('TI-04: PUT /api/rooms/:roomId remove controlador-jogador e cria fantasma', async () => {
    const createRes = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: true });
    const roomId = createRes.body.id;
    const other = [{ id: 'p2', name: 'Beto', score: 10, isLocal: true, positionDelta: 0, status: 'playing' }];
    const updateRes = await request(app).put(`/api/rooms/${roomId}`).send({ players: other });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.isControllerPlaying).toBe(false);
    expect(updateRes.body.controllerPlayerId).toBeNull();
    expect(updateRes.body.players).toHaveLength(2);
    expect(updateRes.body.players[1].isController).toBe(true);
    expect(updateRes.body.players[1].status).toBeUndefined();
  });

  it('GET /api/rooms/:idOrCode retorna 200 para existente e 404 para inválido', async () => {
    const notFound = await request(app).get('/api/rooms/invalid');
    expect(notFound.status).toBe(404);
    const created = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: true });
    const byId = await request(app).get(`/api/rooms/${created.body.id}`);
    expect(byId.status).toBe(200);
    const byCode = await request(app).get(`/api/rooms/${created.body.code}`);
    expect(byCode.status).toBe(200);
  });

  it('POST /api/rooms/:idOrCode/join valida entrada e registra jogador', async () => {
    const created = await request(app).post('/api/rooms').send({ controllerName: 'Ana', isControllerPlaying: true });
    const emptyName = await request(app).post(`/api/rooms/${created.body.id}/join`).send({});
    expect(emptyName.status).toBe(400);
    const notFound = await request(app).post('/api/rooms/invalid/join').send({ name: 'Carlos' });
    expect(notFound.status).toBe(404);
    const joined = await request(app).post(`/api/rooms/${created.body.id}/join`).send({ name: 'Carlos' });
    expect(joined.status).toBe(201);
  });
});
