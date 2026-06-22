import { useCallback, useMemo, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import { MOUNTS, getMountById } from "../../data/mounts";

export default function MountPanel() {
  const playerCharacter = useGameStore((s) => s.playerCharacter);
  const buyMountAction = useGameStore((s) => s.buyMount);
  const equipMountAction = useGameStore((s) => s.equipMount);
  const refreshPlayerCharacter = useGameStore((s) => s.refreshPlayerCharacter);
  const setScreen = useGameStore((s) => s.setScreen);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ownedMounts = playerCharacter?.ownedMounts ?? [];
  const activeMountId = playerCharacter?.mountId;
  const activeMount = activeMountId ? getMountById(activeMountId) : null;
  const bonuses = activeMount?.statBonuses ?? null;

  const level = playerCharacter?.level ?? 1;
  const eclats = playerCharacter?.eclats ?? 0;

  const handleBuy = useCallback(
    (mountId: string) => {
      const result = buyMountAction(mountId);
      if (result.success) {
        setMessage("Monture achetée !");
        setError("");
        refreshPlayerCharacter();
      } else {
        setError(result.error ?? "Erreur");
        setMessage("");
      }
    },
    [buyMountAction, refreshPlayerCharacter]
  );

  const handleEquip = useCallback(
    (mountId: string | null) => {
      const result = equipMountAction(mountId);
      if (result.success) {
        setMessage(mountId ? "Monture équipée !" : "Monture rangée.");
        setError("");
        refreshPlayerCharacter();
      } else {
        setError(result.error ?? "Erreur");
        setMessage("");
      }
    },
    [equipMountAction, refreshPlayerCharacter]
  );

  const statBonusText = useMemo(() => {
    if (!bonuses) return null;
    const parts: string[] = [];
    if (bonuses.vitality) parts.push(`+${bonuses.vitality} Vitalité`);
    if (bonuses.strength) parts.push(`+${bonuses.strength} Force`);
    if (bonuses.intelligence) parts.push(`+${bonuses.intelligence} Intelligence`);
    if (bonuses.agility) parts.push(`+${bonuses.agility} Agilité`);
    if (bonuses.wisdom) parts.push(`+${bonuses.wisdom} Sagesse`);
    if (bonuses.chance) parts.push(`+${bonuses.chance} Chance`);
    if (bonuses.mp) parts.push(`+${bonuses.mp} PM`);
    return parts.join(" • ");
  }, [bonuses]);

  return (
    <div className="flex-1 flex flex-col bg-aether-950 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-xl font-bold">Montures</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {eclats}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {message && <p className="text-green-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {activeMount ? (
          <div className="card border-aether-500">
            <p className="text-aether-400 text-xs mb-2">Monture active</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeMount.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white">{activeMount.name}</p>
                <p className="text-aether-400 text-sm">{activeMount.description}</p>
                {statBonusText && (
                  <p className="text-green-400 text-xs mt-1">Bonus : {statBonusText}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEquip(null)}
              className="btn-secondary w-full mt-3 text-sm"
            >
              Descendre
            </button>
          </div>
        ) : (
          <div className="card text-center py-6 border-dashed">
            <p className="text-4xl mb-2">🐴</p>
            <p className="text-aether-400 text-sm">Aucune monture équipée</p>
          </div>
        )}

        <section>
          <h2 className="text-aether-400 text-sm mb-2">
            Mes montures ({ownedMounts.length})
          </h2>
          {ownedMounts.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">
              Achetez une monture ci-dessous pour voyager plus vite !
            </p>
          ) : (
            ownedMounts.map((mountId) => {
              const mount = getMountById(mountId);
              if (!mount) return null;
              const isActive = mountId === activeMountId;
              return (
                <div
                  key={mountId}
                  className={`card mb-2 flex items-center gap-3 ${isActive ? "border-aether-500" : ""}`}
                >
                  <span className="text-2xl">{mount.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{mount.name}</p>
                    <p className="text-aether-500 text-xs">Niv. {mount.levelRequired}</p>
                  </div>
                  {!isActive && (
                    <button
                      onClick={() => handleEquip(mountId)}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      Monter
                    </button>
                  )}
                </div>
              );
            })
          )}
        </section>

        <section>
          <h2 className="text-aether-400 text-sm mb-2">Écurie — Montures à vendre</h2>
          {MOUNTS.map((mount) => {
            const owned = ownedMounts.includes(mount.id);
            const canBuy = level >= mount.levelRequired && eclats >= mount.kamasCost;
            const locked = level < mount.levelRequired;

            return (
              <div
                key={mount.id}
                className={`card mb-2 flex items-center gap-3 ${owned ? "opacity-60" : ""}`}
              >
                <span className="text-2xl">{mount.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{mount.name}</p>
                  <p className="text-aether-500 text-xs truncate">{mount.description}</p>
                  <p className="text-aether-400 text-[10px] mt-0.5">
                    Niv. {mount.levelRequired} • ✦ {mount.kamasCost.toLocaleString("fr-FR")} kamas
                  </p>
                </div>
                {owned ? (
                  <span className="text-green-400 text-xs">Possédée</span>
                ) : locked ? (
                  <span className="text-aether-600 text-xs">🔒</span>
                ) : (
                  <button
                    onClick={() => handleBuy(mount.id)}
                    disabled={!canBuy}
                    className={`text-xs py-1 px-3 rounded-lg ${
                      canBuy ? "btn-primary" : "btn-secondary opacity-50"
                    }`}
                  >
                    Acheter
                  </button>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
