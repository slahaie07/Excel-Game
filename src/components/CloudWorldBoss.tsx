import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function CloudWorldBoss({ characterId }: { characterId: Id<"characters"> }) {
  const boss = useQuery(api.worldBoss.getWorldBoss, {});
  const leaderboard = useQuery(api.worldBoss.getBossLeaderboard, { limit: 5 });
  const attack = useMutation(api.worldBoss.attackWorldBoss);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!boss) return null;

  const handleAttack = async () => {
    setLoading(true);
    try {
      const result = await attack({ characterId });
      setMessage(
        result.defeated
          ? `🎉 Boss vaincu ! +${result.rewardEclats} ✦`
          : `-${result.damage} PV • +${result.rewardEclats} ✦`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-3 mt-2 card border-red-500/40">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">👹</span>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">{boss.name}</p>
          <p className="text-aether-500 text-[10px]">
            {boss.status === "active"
              ? `${boss.hpPercent}% PV • Boss monde ☁️`
              : "Vaincu — respawn bientôt"}
          </p>
        </div>
        <button
          onClick={() => void handleAttack()}
          disabled={loading || boss.status === "defeated"}
          className="btn-primary text-xs py-1 px-3 disabled:opacity-50"
        >
          Attaquer
        </button>
      </div>
      <div className="h-2 bg-aether-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all"
          style={{ width: `${boss.hpPercent}%` }}
        />
      </div>
      {message && <p className="text-aether-400 text-[10px] mt-1">{message}</p>}
      {(leaderboard ?? []).length > 0 && (
        <div className="mt-2 pt-2 border-t border-aether-800">
          <p className="text-aether-500 text-[10px] mb-1">Top dégâts</p>
          {leaderboard!.slice(0, 3).map((e, i) => (
            <p key={e.characterName} className="text-aether-400 text-[10px]">
              {i + 1}. {e.characterName} — {e.totalDamage}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
