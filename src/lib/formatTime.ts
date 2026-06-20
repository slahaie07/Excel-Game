/** Formate un timestamp futur en compte à rebours lisible */
export function formatCountdown(endsAt: number, now = Date.now()): string {
  const diff = Math.max(0, endsAt - now);
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function warProgressPercent(myScore: number, enemyScore: number): number {
  const total = myScore + enemyScore;
  if (total === 0) return 50;
  return Math.round((myScore / total) * 100);
}
