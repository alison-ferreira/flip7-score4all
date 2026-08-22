import { useState } from 'react';
import { Player } from '../types';
import { calculateRoundScore } from '../lib/scoreCalculator';

type ScoreKeypadProps = {
  player: Player;
  onConfirm: (total: number) => void;
  onCancel: () => void;
};

export default function ScoreKeypad({ player, onConfirm, onCancel }: ScoreKeypadProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [selectedBonus, setSelectedBonus] = useState<Set<number>>(new Set());
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);

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
              <div
                key={i}
                className={`card-toggle ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && toggleNumber(i)}
              >
                {i}
              </div>
            );
          })}
        </div>
        <div className="section-title">Modificadores de Ponto</div>
        <div className="bonus-grid">
          <div
            className={`bonus-toggle mult-toggle ${isMultiplierActive ? 'active' : ''}`}
            onClick={() => setIsMultiplierActive(!isMultiplierActive)}
          >
            2x
          </div>
          {[2, 4, 6, 8, 10].map((val) => (
            <div
              key={val}
              className={`bonus-toggle ${selectedBonus.has(val) ? 'active' : ''}`}
              onClick={() => toggleBonus(val)}
            >
              +{val}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn-confirm" onClick={() => onConfirm(total)}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
