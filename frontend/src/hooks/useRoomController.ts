import { useState, FormEvent } from 'react';
import { Player, PlayerRoundDraft } from '../types';
import { useRoomSync } from './useRoomSync';
import { saveRoomState } from '../lib/api/roomApi';
import { createControllerGameActions } from './useControllerGameActions';

export function useRoomController(code?: string) {
  const { room, setRoom } = useRoomSync(code);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [calcPlayer, setCalcPlayer] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string): void {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const actions = createControllerGameActions(room, setRoom, showToast);

  function handleAddLocalPlayer(e: FormEvent): void {
    e.preventDefault();
    if (!localPlayerName.trim() || !room) return;
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: localPlayerName.trim(),
      score: 0,
      isLocal: true,
      positionDelta: 0,
      status: 'playing',
      isDealer: false,
    };
    actions.savePlayers([...room.players, newPlayer]);
    setLocalPlayerName('');
  }

  function handleScoreConfirm(_points: number, draft?: PlayerRoundDraft): void {
    if (calcPlayer && draft) actions.confirmScore(calcPlayer.id, draft);
    setCalcPlayer(null);
  }

  function handleSetupSubmit(name: string, isPlaying: boolean): void {
    if (!room) return;
    const ctrlPlayer: Player = {
      id: Date.now().toString(),
      name,
      score: 0,
      isLocal: true,
      positionDelta: 0,
      status: isPlaying ? 'playing' : undefined,
      isDealer: false,
      isController: true,
    };
    saveRoomState(room.id, [ctrlPlayer, ...room.players])
      .then((updated) => {
        setRoom({
          ...updated,
          controllerName: name,
          isControllerPlaying: isPlaying,
          controllerPlayerId: isPlaying ? ctrlPlayer.id : null,
        });
      })
      .catch(console.error);
  }

  return {
    room,
    localPlayerName,
    setLocalPlayerName,
    calcPlayer,
    setCalcPlayer,
    toastMessage,
    handleSavePlayers: actions.savePlayers,
    handleAddLocalPlayer,
    handleScoreConfirm,
    handleFinishRound: actions.finishRound,
    handleResetConfirm: actions.resetGame,
    handleSetupSubmit,
    updateStatus: actions.updateStatus,
    setDealerAction: actions.setDealer,
  };
}
