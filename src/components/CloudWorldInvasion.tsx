import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";

export function CloudWorldInvasion({ characterId, zoneId, characterName }: {
  characterId: Id<"characters">;
  zoneId: string;
  characterName: string;
}) {
  const setZone = useGameStore((s) => s.setZone);
  const invasion = useQuery(api.worldInvasions.getActiveInvasion, {});
  const initInvasion = useMutation(api.worldInvasions.initInvasion);
  const myContribution = useQuery(
    api.worldInvasions.getMyInvasionContribution,
    invasion ? { invasionId: invasion._id, characterId } : "skip"
  );
  const claimReward = useMutation(api.worldInvasions.claimInvasionReward);
  const attackBoss = useMutation(api.worldInvasions.attackInvasionBoss);
  const [message, setMessage] = useState("");
  const [bossLoading, setBossLoading] = useState(false);

  useEffect(() => {
    if (invasion === null) {
      void initInvasion({});
    }
  }, [invasion, initInvasion]);

  if (!invasion) return null;

  const isLocalZone = invasion.zoneId === zoneId;
  const canClaim =
    myContribution &&
    (myContribution.kills > 0 || myContribution.bossDamage > 0) &&
    !myContribution.rewardClaimed &&
    (invasion.bossDefeated || invasion.progressPercent >= 100);

  const handleAttackBoss = async () => {
    setBossLoading(true);
    try {
      const result = await attackBoss({
        invasionId: invasion._id,
        characterId,
        characterName,
      });
      setMessage(
        result.defeated
          ? `💀 Avatar vaincu ! +${result.rewardEclats} ✦`
          : `-${result.damage} PV boss (${result.bossHpPercent}% restants) +${result.rewardEclats} ✦`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBossLoading(false);
    }
  };

  return (
    <div className={`mx-3 mt-2 card ${isLocalZone ? "border-red-600/50 bg-red-950/20" : "border-aether-600/40"}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{invasion.bossActive ? "💀" : "🌑"}</span>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">
            {invasion.bossActive ? invasion.bossName ?? "Avatar des Ombres" : invasion.name}
          </p>
          <p className="text-aether-500 text-[10px]">
            {invasion.bossActive
              ? `Boss final • Menace ${invasion.threatLevel}%`
              : `Menace ${invasion.threatLevel}% • ${invasion.hoursLeft}h restantes`}
          </p>
          {!isLocalZone && !invasion.bossActive && (
            <p className="text-orange-400 text-[10px]">Zone cible : {invasion.zoneId.replace(/_/g, " ")}</p>
          )}
        </div>
        {!isLocalZone && !invasion.bossActive && (
          <button onClick={() => setZone(invasion.zoneId)} className="btn-secondary text-xs py-1 px-2">
            Y aller
          </button>
        )}
        {invasion.bossActive && isLocalZone && !invasion.bossDefeated && (
          <button
            onClick={() => void handleAttackBoss()}
            disabled={bossLoading}
            className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
          >
            {bossLoading ? "..." : "Attaquer"}
          </button>
        )}
        {canClaim && (
          <button
            onClick={() => {
              void claimReward({ invasionId: invasion._id, characterId })
                .then((r) => setMessage(`+${r.eclats} ✦ réclamés !`))
                .catch((e) => setMessage(e instanceof Error ? e.message : "Erreur"));
            }}
            className="btn-primary text-xs py-1 px-2"
          >
            Réclamer
          </button>
        )}
      </div>
      <div className="h-2 bg-aether-900 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full transition-all ${invasion.bossActive ? "bg-gradient-to-r from-red-900 to-purple-600" : "bg-gradient-to-r from-purple-800 to-red-600"}`}
          style={{
            width: `${invasion.bossActive ? (invasion.bossHpPercent ?? 100) : invasion.progressPercent}%`,
          }}
        />
      </div>
      <p className="text-aether-500 text-[10px] mt-1">
        {invasion.bossActive
          ? `Boss : ${invasion.bossHpPercent ?? 100}% PV restants`
          : `${invasion.globalProgress.toLocaleString()} / ${invasion.globalTarget.toLocaleString()} ombres repoussées`}
        {myContribution && ` • Vous : ${myContribution.kills} kill(s)${myContribution.bossDamage > 0 ? `, ${myContribution.bossDamage} dmg boss` : ""}`}
      </p>
      {message && <p className="text-green-400 text-[10px] mt-1">{message}</p>}
    </div>
  );
}
