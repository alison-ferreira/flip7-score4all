import { useState } from 'react';
import { Player, PlayerRoundDraft } from '../types';
import { calculateRoundScore } from '../lib/scoreCalculator';

type ScoreKeypadProps = {
  player: Player;
  initialDraft?: PlayerRoundDraft;
  onConfirm: (total: number, draft?: PlayerRoundDraft) => void;
  onCancel: () => void;
};

export default function ScoreKeypad({ player, initialDraft, onConfirm, onCancel }: ScoreKeypadProps) {
  const activeDraft = initialDraft ?? player.roundDraft;
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    () => new Set(activeDraft?.selectedNumbers || [])
  );
  const [selectedBonus, setSelectedBonus] = useState<Set<number>>(
    () => new Set(activeDraft?.selectedBonus || [])
  );
  const [isMultiplierActive, setIsMultiplierActive] = useState<boolean>(
    () => activeDraft?.isMultiplierActive ?? false
  );

  function toggleNumber(num: number): void {
    const newSet = new Set(selectedNumbers);
    if (newSet.has(num)) {
      newSet.delete(num);
    } else if (newSet.size < 7) {
      newSet.add(num);
    }
    setSelectedNumbers(newSet);
  }

  function toggleBonus(val: number): void {
    const newSet = new Set(selectedBonus);
    if (newSet.has(val)) {
      newSet.delete(val);
    } else {
      newSet.add(val);
    }
    setSelectedBonus(newSet);
  }

  const { exp, total } = calculateRoundScore(selectedNumbers, selectedBonus, isMultiplierActive);

  function handleConfirm(): void {
    const draft: PlayerRoundDraft = {
      selectedNumbers: Array.from(selectedNumbers),
      selectedBonus: Array.from(selectedBonus),
      isMultiplierActive,
      total
    };
    onConfirm(total, draft);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{player.name}</h3>
        </div>
        <div className="display-container">
          <div className="calc-exp">{exp}</div>
          <div className="calc-res">{total}</div>
        </div>
        <div className="section-title">Cartas de Número</div>
        <div className="cards-grid">
          {[...Array(13).keys()].map((i) => {
            const isActive = selectedNumbers.has(i);
            const isDisabled = !isActive && selectedNumbers.size >= 7;
            return (
              <button
                type="button"
                key={i}
                aria-label={`Carta ${i}`}
                aria-pressed={isActive}
                disabled={isDisabled}
                className={`card-toggle ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && toggleNumber(i)}
              >
                {i}
              </button>
            );
          })}
        </div>
        <div className="section-title">Modificadores de Ponto</div>
        <div className="bonus-grid">
          <button
            type="button"
            aria-label="Multiplicador 2x"
            aria-pressed={isMultiplierActive}
            className={`bonus-toggle mult-toggle ${isMultiplierActive ? 'active' : ''}`}
            onClick={() => setIsMultiplierActive(!isMultiplierActive)}
          >
            2x
          </button>
          {[2, 4, 6, 8, 10].map((val) => (
            <button
              type="button"
              key={val}
              aria-label={`Bônus +${val}`}
              aria-pressed={selectedBonus.has(val)}
              className={`bonus-toggle ${selectedBonus.has(val) ? 'active' : ''}`}
              onClick={() => toggleBonus(val)}
            >
              +{val}
            </button>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn-confirm" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
