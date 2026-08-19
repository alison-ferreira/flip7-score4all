import { useState } from 'react'

export type Player = {
  id: string;
  name: string;
  score: number;
  isLocal: boolean;
};

type ScoreKeypadProps = {
  player: Player;
  onConfirm: (total: number) => void;
  onCancel: () => void;
};

export default function ScoreKeypad({ player, onConfirm, onCancel }: ScoreKeypadProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set())
  const [selectedBonus, setSelectedBonus] = useState<Set<number>>(new Set())
  const [isMultiplierActive, setIsMultiplierActive] = useState(false)

  const toggleNumber = (num: number) => {
    const newSet = new Set(selectedNumbers)
    if (newSet.has(num)) {
      newSet.delete(num)
    } else {
      if (newSet.size >= 7) return
      newSet.add(num)
    }
    setSelectedNumbers(newSet)
  }

  const toggleBonus = (val: number) => {
    const newSet = new Set(selectedBonus)
    if (newSet.has(val)) {
      newSet.delete(val)
    } else {
      newSet.add(val)
    }
    setSelectedBonus(newSet)
  }

  const toggleMultiplier = () => {
    setIsMultiplierActive(!isMultiplierActive)
  }

  // Calculation Logic
  const getCalculation = () => {
    if (selectedNumbers.size === 0 && selectedBonus.size === 0 && !isMultiplierActive) {
      return { exp: "Selecione as cartas da rodada", total: 0 }
    }

    const parts: string[] = []
    const numArr = Array.from(selectedNumbers).sort((a, b) => a - b)
    const numSum = numArr.reduce((acc, val) => acc + val, 0)
    const calculatedNumberSum = isMultiplierActive ? numSum * 2 : numSum

    if (numArr.length > 0) {
      const numText = numArr.join('+')
      if (isMultiplierActive) {
        parts.push(`(${numText})x2`)
      } else {
        parts.push(numText)
      }
    }

    const bonusArr = Array.from(selectedBonus).sort((a, b) => a - b)
    const bonusSum = bonusArr.reduce((acc, val) => acc + val, 0)
    if (bonusArr.length > 0) {
      const bonusText = bonusArr.map(b => `+${b}`).join('')
      parts.push(`(${bonusText})`)
    }

    let flip7Sum = 0
    if (selectedNumbers.size === 7) {
      flip7Sum = 15
      parts.push("15[Flip7]")
    }

    const total = calculatedNumberSum + bonusSum + flip7Sum
    return { exp: parts.join('+') || "0", total }
  }

  const { exp, total } = getCalculation()

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
          {[...Array(13).keys()].map(i => {
            const isActive = selectedNumbers.has(i)
            const isDisabled = !isActive && selectedNumbers.size >= 7
            return (
              <div 
                key={i} 
                className={`card-toggle ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && toggleNumber(i)}
              >
                {i}
              </div>
            )
          })}
        </div>

        <div className="section-title">Modificadores de Ponto</div>
        <div className="bonus-grid">
          <div 
            className={`bonus-toggle mult-toggle ${isMultiplierActive ? 'active' : ''}`}
            onClick={toggleMultiplier}
          >
            2x
          </div>
          {[2, 4, 6, 8, 10].map(val => (
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
          <button 
            className="btn-confirm" 
            onClick={() => onConfirm(total)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
