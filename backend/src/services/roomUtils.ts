import { Player } from './roomTypes';

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function updateScoresAndCalculateDeltas(
  players: Player[],
  getScoreToAdd: (p: Player) => number
): void {
  const oldRanking = [...players].sort((a, b) => b.score - a.score);
  const oldPositions = new Map<string, number>();
  oldRanking.forEach((p, index) => oldPositions.set(p.id, index));
  players.forEach(p => {
    p.score += getScoreToAdd(p);
    delete p.roundDraft;
    p.status = 'playing';
  });
  const newRanking = [...players].sort((a, b) => b.score - a.score);
  const newPositions = new Map<string, number>();
  newRanking.forEach((p, index) => newPositions.set(p.id, index));
  players.forEach(p => {
    p.positionDelta = (oldPositions.get(p.id) ?? 0) - (newPositions.get(p.id) ?? 0);
  });
}
