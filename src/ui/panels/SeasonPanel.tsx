import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useGameStore } from "../../stores/gameStore";
import { loadCharacter } from "../../lib/characterStorage";
import { formatCountdown } from "../../lib/formatTime";
import {
  ensureSeasonProgress,
  getSeasonProgress,
  claimSeasonQuestReward,
  getSeasonLeaderboardScore,
  getSeasonNotifications,
} from "../../lib/seasonEngine";
import { isConvexEnabled } from "../../lib/convexUtils";

type Tab = "pass" | "quests" | "shop" | "classement";

export default function SeasonPanel() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const storeClaimTier = useGameStore((s) => s.claimSeasonTier);
  const storeBuyItem = useGameStore((s) => s.buySeasonItem);

  const [tab, setTab] = useState<Tab>("pass");
  const [, setTick] = useState(0);
  const [message, setMessage] = useState("");

  const char = loadCharacter(characterId);
  ensureSeasonProgress(characterId);
  const view = getSeasonProgress(char);

  const season = view?.season;
  const submitScore = useMutation(api.seasons.submitGuestSeasonScore);
  const leaderboard = useQuery(
    api.seasons.getSeasonEventLeaderboard,
    isConvexEnabled() && season ? { seasonId: season.id, limit: 15 } : "skip"
  );

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isConvexEnabled() || !season || !view) return;
    void submitScore({
      seasonId: season.id,
      playerName: characterName,
      score: getSeasonLeaderboardScore(view.progress),
    });
  }, [season?.id, characterName, view?.progress.passXp, view?.progress.currency, submitScore]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  if (!view || !season) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950 items-center justify-center p-8">
        <p className="text-aether-400">Aucune saison active.</p>
        <button onClick={() => setScreen("world")} className="btn-secondary mt-4">Retour</button>
      </div>
    );
  }

  const { progress, passXp, maxPassXp, passPercent } = view;
  const countdown = formatCountdown(season.endsAt);
  const notifications = getSeasonNotifications(characterId);

  const handleClaimTier = (tier: number) => {
    const result = storeClaimTier(tier);
    setMessage(result.ok ? `Palier ${tier} réclamé !` : (result.error ?? "Erreur"));
    refresh();
  };

  const handleClaimQuest = (questId: string) => {
    const result = claimSeasonQuestReward(characterId, questId);
    setMessage(result.ok ? "Récompense de quête réclamée !" : (result.error ?? "Erreur"));
    refresh();
  };

  const handleBuy = (itemId: string) => {
    const result = storeBuyItem(itemId);
    setMessage(result.ok ? "Achat effectué !" : (result.error ?? "Erreur"));
    refresh();
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      {/* Bannière saison */}
      <div
        className="relative overflow-hidden border-b border-aether-700/40"
        style={{ borderColor: `${season.color}40` }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${season.color}, transparent)` }}
        />
        <div className="relative flex items-center gap-3 p-4">
          <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
          <span className="text-3xl">{season.icon}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold truncate" style={{ color: season.color }}>
              {season.name}
            </h1>
            <p className="text-aether-500 text-xs">Se termine dans {countdown}</p>
          </div>
          <div className="text-right">
            <p className="text-crystal-gold font-bold text-sm">
              {season.currencyIcon} {progress.currency}
            </p>
            <p className="text-aether-500 text-[10px]">{season.currencyName}</p>
          </div>
        </div>
        <p className="relative px-4 pb-3 text-aether-400 text-xs">{season.description}</p>
      </div>

      {message && (
        <div className="mx-4 mt-2 card py-2 px-3 text-center text-aether-300 text-xs">{message}</div>
      )}

      {notifications.length > 0 && (
        <div className="mx-4 mt-2 card py-2 px-3 border-green-500/30">
          <p className="text-green-400 text-xs">{notifications[0]?.message}</p>
        </div>
      )}

      {/* Barre de progression pass */}
      <div className="mx-4 mt-3 card" style={{ borderColor: `${season.color}50` }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-aether-300">Pass saisonnier</span>
          <span className="text-aether-500">{passXp} / {maxPassXp} XP</span>
        </div>
        <div className="h-3 bg-aether-950 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${passPercent}%`, backgroundColor: season.color }}
          />
        </div>
        <div className="flex justify-between mt-2 gap-1">
          {season.passTiers.map((tier) => {
            const claimed = progress.claimedTiers.includes(tier.tier);
            const unlocked = passXp >= tier.passXpRequired;
            return (
              <div
                key={tier.tier}
                className={`flex-1 text-center text-[9px] py-1 rounded ${
                  claimed ? "bg-green-900/40 text-green-400" : unlocked ? "bg-aether-800/60 text-aether-200" : "text-aether-600"
                }`}
              >
                {tier.tier}
              </div>
            );
          })}
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-aether-700/40 mx-4 mt-3">
        {([
          ["pass", "Pass"],
          ["quests", "Quêtes"],
          ["shop", "Boutique"],
          ["classement", "Classement"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-xs ${tab === id ? "text-aether-200 border-b-2" : "text-aether-500"}`}
            style={tab === id ? { borderColor: season.color } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "pass" && (
          <div className="space-y-2">
            {season.passTiers.map((tier) => {
              const claimed = progress.claimedTiers.includes(tier.tier);
              const canClaim = !claimed && passXp >= tier.passXpRequired;
              return (
                <div key={tier.tier} className={`card flex items-center gap-3 ${claimed ? "opacity-60" : ""}`}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: `${season.color}30`, color: season.color }}
                  >
                    {tier.tier}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{tier.label}</p>
                    <p className="text-aether-500 text-xs">{tier.passXpRequired} XP requis</p>
                  </div>
                  {claimed ? (
                    <span className="text-green-400 text-xs">✅ Réclamé</span>
                  ) : canClaim ? (
                    <button onClick={() => handleClaimTier(tier.tier)} className="btn-secondary text-xs py-1 px-3">
                      Réclamer
                    </button>
                  ) : (
                    <span className="text-aether-600 text-xs">🔒</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "quests" && (
          <div className="space-y-3">
            {season.quests.map((quest) => {
              const qProgress = progress.objectives.find((o) => o.questId === quest.id);
              const isDone = qProgress?.completed;
              const isClaimed = qProgress?.claimed;

              return (
                <div key={quest.id} className="card">
                  <p className="font-bold text-white text-sm">{quest.name}</p>
                  <p className="text-aether-400 text-xs mt-1">{quest.description}</p>
                  <p className="text-crystal-gold text-xs mt-1">
                    +{quest.rewards.seasonCurrency} {season.currencyName} • +{quest.rewards.passXp} XP pass
                  </p>
                  {qProgress?.objectives.map((obj, i) => (
                    <div key={i} className="mt-2">
                      <div className="flex justify-between text-xs text-aether-500 mb-1">
                        <span>{quest.objectives[i]?.description}</span>
                        <span>{obj.current}/{obj.required}</span>
                      </div>
                      <div className="h-1.5 bg-aether-950 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (obj.current / obj.required) * 100)}%`,
                            backgroundColor: season.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isDone && !isClaimed && (
                    <button onClick={() => handleClaimQuest(quest.id)} className="btn-secondary text-xs py-1 px-3 mt-2">
                      Réclamer
                    </button>
                  )}
                  {isClaimed && <p className="text-green-400 text-xs mt-2">✅ Terminée</p>}
                  {!qProgress && (
                    <p className="text-aether-500 text-xs mt-2">Progression automatique en jouant</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "shop" && (
          <div className="space-y-2">
            <p className="text-aether-400 text-xs mb-2">
              Solde : {season.currencyIcon} {progress.currency} {season.currencyName}
            </p>
            {season.shopItems.map((item) => {
              const bought = progress.shopPurchases[item.id] ?? 0;
              const remaining = item.stock - bought;
              return (
                <div key={item.id} className="card flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{item.name}</p>
                    <p className="text-aether-500 text-xs truncate">{item.description}</p>
                    <p className="text-aether-600 text-[10px]">Stock : {remaining}/{item.stock}</p>
                  </div>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={remaining <= 0 || progress.currency < item.cost}
                    className="btn-secondary text-xs py-1 px-3 disabled:opacity-40 whitespace-nowrap"
                  >
                    {season.currencyIcon} {item.cost}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "classement" && (
          <div className="space-y-2">
            <div className="card border-aether-600/50">
              <p className="text-aether-300 text-sm font-semibold">Votre score</p>
              <p className="text-crystal-gold text-lg font-bold">
                {getSeasonLeaderboardScore(progress)} pts
              </p>
              <p className="text-aether-500 text-xs">{characterName}</p>
            </div>
            {!isConvexEnabled() ? (
              <p className="text-aether-500 text-xs text-center py-4">
                Classement global disponible en mode connecté.
              </p>
            ) : leaderboard === undefined ? (
              <p className="text-aether-500 text-sm text-center">Chargement...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-aether-500 text-xs text-center py-4">Soyez le premier au classement !</p>
            ) : (
              leaderboard.map((entry: { playerName: string; score: number }, i: number) => (
                <div key={`${entry.playerName}-${i}`} className="card flex items-center gap-3 py-2">
                  <span className="text-aether-500 w-6 text-sm font-bold">#{i + 1}</span>
                  <span className="text-white text-sm flex-1">{entry.playerName}</span>
                  <span className="text-crystal-gold text-sm">{entry.score} pts</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
