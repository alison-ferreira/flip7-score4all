import { Room, Player, PlayerStatus, PlayerRoundDraft } from '../types';
import {
  saveRoomState,
  finishRound as apiFinishRound,
  updatePlayerStatus,
  setDealer,
  updatePlayerDraft,
  resetGame as apiResetGame,
} from '../lib/api/roomApi';

export function createControllerGameActions(
  room: Room | null,
  setRoom: (room: Room) => void,
  showToast: (msg: string) => void
) {
  return {
    savePlayers: (players: Player[]) => {
      if (room) saveRoomState(room.id, players).then(setRoom).catch(console.error);
    },
    confirmScore: (playerId: string, draft: PlayerRoundDraft) => {
      if (room) {
        updatePlayerDraft(room.id, playerId, draft)
          .then((updated) => {
            setRoom(updated);
            showToast('Rascunho de pontuação salvo!');
          })
          .catch(console.error);
      }
    },
    finishRound: () => {
      if (room) {
        apiFinishRound(room.id)
          .then((updated) => {
            setRoom(updated);
            showToast('Rodada finalizada com sucesso!');
          })
          .catch(console.error);
      }
    },
    resetGame: (isControllerPlaying: boolean) => {
      if (room) {
        apiResetGame(room.id, { isControllerPlaying })
          .then((updated) => {
            setRoom(updated);
            showToast('Partida reiniciada!');
          })
          .catch(console.error);
      }
    },
    updateStatus: (pId: string, st: PlayerStatus) => {
      if (room) updatePlayerStatus(room.id, pId, st).then(setRoom).catch(console.error);
    },
    setDealer: (pId: string) => {
      if (room) setDealer(room.id, pId).then(setRoom).catch(console.error);
    },
  };
}
