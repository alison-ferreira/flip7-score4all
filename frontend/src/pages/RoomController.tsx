import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ScoreKeypad from '../components/ScoreKeypad';
import ControllerHeader from '../components/ControllerHeader';
import ControllerActions from '../components/ControllerActions';
import ControllerRankingList from '../components/ControllerRankingList';
import ResetGameModal from '../components/ResetGameModal';
import ViewerModal from '../components/ViewerModal';
import ControllerSetup from '../components/ControllerSetup';
import { useRoomController } from '../hooks/useRoomController';

export default function RoomController() {
  const { code } = useParams<{ code: string }>();
  const ctrl = useRoomController(code);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const room = ctrl.room;

  if (!room) return <div className="container"><p className="w-full text-center">Carregando sala...</p></div>;
  if (!room.controllerName) {
    return (
      <div className="container">
        <header><h1>Configuração do Controlador</h1></header>
        <div className="panel"><ControllerSetup onSubmit={ctrl.handleSetupSubmit} /></div>
      </div>
    );
  }

  const rankedActive = [...room.players].filter((p) => !(p.isController && !room.isControllerPlaying)).sort((a, b) => b.score - a.score);
  const ghost = room.players.find((p) => p.isController && !room.isControllerPlaying);
  const rankedPlayers = ghost ? [...rankedActive, ghost] : rankedActive;

  return (
    <div className="container">
      <ControllerHeader round={room.round} code={room.code} controllerName={room.controllerName} />
      <div className="panel">
        <h2 className="flex justify-between items-center flex-wrap gap-2">
          <span>Ranking & Ações</span>
          <ControllerActions
            onOpenViewerModal={() => setIsViewerModalOpen(true)}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onFinishRound={ctrl.handleFinishRound}
          />
        </h2>
        <form className="input-group" onSubmit={ctrl.handleAddLocalPlayer}>
          <input type="text" placeholder="Adicionar jogador presencial..." value={ctrl.localPlayerName} onChange={(e) => ctrl.setLocalPlayerName(e.target.value)} required />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        <ControllerRankingList
          players={rankedPlayers}
          controllerPlayerId={room.controllerPlayerId}
          onOpenKeypad={ctrl.setCalcPlayer}
          onRemove={(id) => ctrl.handleSavePlayers(room.players.filter((item) => item.id !== id))}
          onUpdateStatus={ctrl.updateStatus}
          onSetDealer={ctrl.setDealerAction}
        />
      </div>
      {ctrl.toastMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce" role="status" aria-live="polite" data-testid="toast-message">
          {ctrl.toastMessage}
        </div>
      )}
      <ViewerModal isOpen={isViewerModalOpen} room={room} onClose={() => setIsViewerModalOpen(false)} />
      <ResetGameModal isOpen={isResetModalOpen} initialIsPlaying={room.isControllerPlaying ?? true} onConfirm={(isPlaying) => { ctrl.handleResetConfirm(isPlaying); setIsResetModalOpen(false); }} onCancel={() => setIsResetModalOpen(false)} />
      {ctrl.calcPlayer && <ScoreKeypad player={ctrl.calcPlayer} initialDraft={ctrl.calcPlayer.roundDraft} onConfirm={ctrl.handleScoreConfirm} onCancel={() => ctrl.setCalcPlayer(null)} />}
    </div>
  );
}
