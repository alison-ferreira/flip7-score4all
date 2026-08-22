export type CalculationResult = {
  exp: string;
  total: number;
};

export function calculateRoundScore(
  selectedNumbers: Set<number>,
  selectedBonus: Set<number>,
  isMultiplierActive: boolean
): CalculationResult {
  if (selectedNumbers.size === 0 && selectedBonus.size === 0 && !isMultiplierActive) {
    return { exp: 'Selecione as cartas da rodada', total: 0 };
  }
  const parts: string[] = [];
  const numArr = Array.from(selectedNumbers).sort((a, b) => a - b);
  const numSum = numArr.reduce((acc, val) => acc + val, 0);
  const calculatedNumberSum = isMultiplierActive ? numSum * 2 : numSum;
  if (numArr.length > 0) {
    const numText = numArr.join('+');
    parts.push(isMultiplierActive ? `(${numText})x2` : numText);
  }
  const bonusArr = Array.from(selectedBonus).sort((a, b) => a - b);
  const bonusSum = bonusArr.reduce((acc, val) => acc + val, 0);
  if (bonusArr.length > 0) {
    const bonusText = bonusArr.map((b) => `+${b}`).join('');
    parts.push(`(${bonusText})`);
  }
  let flip7Sum = 0;
  if (selectedNumbers.size === 7) {
    flip7Sum = 15;
    parts.push('15[Flip7]');
  }
  const total = calculatedNumberSum + bonusSum + flip7Sum;
  return { exp: parts.join('+') || '0', total };
}
