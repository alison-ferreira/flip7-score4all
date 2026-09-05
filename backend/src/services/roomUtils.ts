import { Player } from './roomTypes';

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isNonPlayingController(player: Player): boolean {
  return Boolean(player.isController && !player.status);
}

export function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((first, second) => {
    const firstIsGhost = isNonPlayingController(first);
    const secondIsGhost = isNonPlayingController(second);
    if (firstIsGhost && !secondIsGhost) return 1;
    if (!firstIsGhost && secondIsGhost) return -1;
    return second.score - first.score;
  });
}

export const rankPlayers = sortPlayers;

export function updateScoresAndCalculateDeltas(
  players: Player[],
  getScoreToAdd: (p: Player) => number
): void {
  const activePlayers = players.filter(p => !isNonPlayingController(p));
  const oldRanking = sortPlayers(activePlayers);
  const oldPositions = new Map<string, number>();
  oldRanking.forEach((p, index) => oldPositions.set(p.id, index));
  players.forEach(p => {
    if (isNonPlayingController(p)) {
      p.positionDelta = 0;
      return;
    }
    p.score += getScoreToAdd(p);
    delete p.roundDraft;
    p.status = 'playing';
  });
  const newRanking = sortPlayers(players.filter(p => !isNonPlayingController(p)));
  const newPositions = new Map<string, number>();
  newRanking.forEach((p, index) => newPositions.set(p.id, index));
  players.forEach(p => {
    if (isNonPlayingController(p)) {
      p.positionDelta = 0;
      return;
    }
    p.positionDelta = (oldPositions.get(p.id) ?? 0) - (newPositions.get(p.id) ?? 0);
  });
}
