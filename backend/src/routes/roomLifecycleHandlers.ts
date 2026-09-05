import { Request, Response } from 'express';
import { RoomService } from '../services/roomService';

export function handleCreateRoom(req: Request, res: Response): void {
  const { controllerName, isControllerPlaying } = req.body ?? {};
  if (!controllerName || typeof controllerName !== 'string' || !controllerName.trim()) {
    res.status(400).json({ error: 'Nome do controlador é obrigatório' });
    return;
  }
  if (typeof isControllerPlaying !== 'boolean') {
    res.status(400).json({ error: 'isControllerPlaying é obrigatório' });
    return;
  }
  const result = RoomService.createRoom({
    controllerName: controllerName.trim(),
    isControllerPlaying,
  });
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
}

export function handleResetRoom(req: Request, res: Response): void {
  const roomId = req.params.roomId as string;
  const { isControllerPlaying } = req.body ?? {};
  if (typeof isControllerPlaying !== 'boolean') {
    res.status(400).json({ error: 'isControllerPlaying é obrigatório' });
    return;
  }
  const result = RoomService.resetGame(roomId, isControllerPlaying);
  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }
  RoomService.broadcastRoomUpdate(result.id);
  res.status(200).json(result);
}
