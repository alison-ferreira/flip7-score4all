import { Router, Request, Response } from 'express';
import { RoomService } from '../services/roomService';

const router = Router();

// 1. Criar uma nova sala (Controlador)
router.post('/', (_req: Request, res: Response) => {
  const room = RoomService.createRoom();
  res.status(201).json(room);
});

// 2. Obter estado atual da sala (Visualizadores & Controlador fazem polling/SSE fallback)
router.get('/:idOrCode', (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode as string;
  const room = RoomService.getRoomByIdOrCode(idOrCode);
  
  if (!room) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  res.json(room);
});

// Endpoint SSE para atualizações em tempo real da sala
router.get('/:idOrCode/events', (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode as string;
  const room = RoomService.getRoomByIdOrCode(idOrCode);
  
  if (!room) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  RoomService.subscribeToRoom(room.id, res);
});

// 3. Atualizar estado da sala (Controlador salva pontuações)
router.put('/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId as string;
  const { players } = req.body;
  
  const updatedRoom = RoomService.updateRoomPlayers(roomId, players);
  if (!updatedRoom) {
    res.status(404).json({ error: 'Sala não encontrada' });
    return;
  }
  
  RoomService.broadcastRoomUpdate(updatedRoom.id);
  res.json(updatedRoom);
});

// 4. Ingressar em uma sala (Visualizador adicionando seu nome)
router.post('/:idOrCode/join', (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode as string;
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'Nome é obrigatório' });
    return;
  }

  const result = RoomService.joinRoom(idOrCode, name);
  
  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }
  
  if (result.isNew) {
    RoomService.broadcastRoomUpdate(result.room.id);
  }
  
  const status = result.isNew ? 201 : 200;
  res.status(status).json({ room: result.room, player: result.player });
});

// 5. Finalizar rodada (Controlador)
router.post('/:roomId/round/finish', (req: Request, res: Response) => {
  const roomId = req.params.roomId as string;
  const { roundScores } = req.body;

  if (!roundScores || typeof roundScores !== 'object') {
    res.status(400).json({ error: 'roundScores é obrigatório e deve ser um objeto' });
    return;
  }

  const result = RoomService.finishRound(roomId, roundScores);

  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }

  // Notificar clientes via SSE que a rodada acabou
  RoomService.broadcastRoomUpdate(result.id);

  res.json(result);
});

export default router;
