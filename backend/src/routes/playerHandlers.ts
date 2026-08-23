import { Request, Response } from 'express';
import { RoomService, PlayerStatus, PlayerRoundDraft } from '../services/roomService';

export function handleUpdatePlayerStatus(req: Request, res: Response): void {
  const roomId = req.params.roomId as string;
  const playerId = req.params.playerId as string;
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    res.status(400).json({ error: 'Status inválido' });
    return;
  }

  const result = RoomService.updatePlayerStatus(roomId, playerId, status as PlayerStatus);
  if ('error' in result) {
    const statusCode = result.error === 'Status inválido' ? 400 : 404;
    res.status(statusCode).json({ error: result.error });
    return;
  }

  RoomService.broadcastRoomUpdate(result.id);
  res.json(result);
}

export function handleSetDealer(req: Request, res: Response): void {
  const roomId = req.params.roomId as string;
  const playerId = req.params.playerId as string;

  const result = RoomService.setDealer(roomId, playerId);
  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }

  RoomService.broadcastRoomUpdate(result.id);
  res.json(result);
}

export function handleUpdatePlayerDraft(req: Request, res: Response): void {
  const roomId = req.params.roomId as string;
  const playerId = req.params.playerId as string;
  const body = req.body;

  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Formato inválido no corpo' });
    return;
  }

  const { selectedNumbers, selectedBonus, isMultiplierActive, total } = body;
  const isNumArray = (arr: unknown) => Array.isArray(arr) && arr.every(item => typeof item === 'number');

  if (!isNumArray(selectedNumbers) || !isNumArray(selectedBonus) || typeof isMultiplierActive !== 'boolean' || typeof total !== 'number') {
    res.status(400).json({ error: 'Formato inválido no corpo' });
    return;
  }

  const draft: PlayerRoundDraft = {
    selectedNumbers: selectedNumbers as number[],
    selectedBonus: selectedBonus as number[],
    isMultiplierActive,
    total
  };

  const result = RoomService.updatePlayerDraft(roomId, playerId, draft);
  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }

  RoomService.broadcastRoomUpdate(result.id);
  res.json(result);
}
