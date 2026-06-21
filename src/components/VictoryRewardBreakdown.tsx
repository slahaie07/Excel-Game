export function VictoryRewardBreakdown({
  xp,
  eclats,
  territoryMultiplier = 1,
  eventMultiplier = 1,
  baseXp,
}: {
  xp: number;
  eclats: number;
  territoryMultiplier?: number;
  eventMultiplier?: number;
  baseXp?: number;
}) {
  const showTerritory = territoryMultiplier > 1;
  const showEvent = eventMultiplier > 1;
  const base = baseXp ?? (showTerritory ? Math.round(xp / territoryMultiplier) : xp);

  return (
    <div className="text-aether-300 text-sm mb-4 space-y-1">
      <p className="font-semibold text-white">+{xp} XP • +{eclats} ✦</p>
      {(showTerritory || showEvent) && (
        <div className="text-[11px] text-aether-500 space-y-0.5">
          {base !== xp && <p>Base : {base} XP</p>}
          {showTerritory && (
            <p className="text-green-400">🛡️ Territoire ×{territoryMultiplier.toFixed(2)}</p>
          )}
          {showEvent && (
            <p style={{ color: "#c084fc" }}>🎉 Événement ×{eventMultiplier.toFixed(1)}</p>
          )}
        </div>
      )}
    </div>
  );
}
