import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { FACTION_META, FACTION_RANKS, type FactionId } from "../game/data/factionContent";
import { FACTION_RANK_COSMETICS } from "../game/data/factionRewards";
import { CLASSES, getCosmeticById, getItemById } from "../game/data";
import { CAMPAIGN_RANK_REWARDS } from "../game/data/factionCampaignRewards";

export type FactionTab = "reputation" | "quests" | "shop";

export interface FactionSummary {
  factionId: FactionId;
  name: string;
  icon: string;
  description: string;
  reputation: number;
  rank: string;
  rankLabel: string;
  rankIcon: string;
  nextRankLabel: string | null;
  pointsToNext: number | null;
  progressPercent: number;
  isPledged: boolean;
}

export interface FactionQuestView {
  _id: string | null;
  questId: string;
  factionId: FactionId;
  label: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardReputation: number;
  rewardEclats: number;
}

export interface FactionCampaignView {
  factionId: FactionId;
  campaignId: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  status: "active" | "completed";
  progressPercent: number;
  myPoints: number;
  minContribution: number;
  rewardReputation: number;
  rewardEclats: number;
  canClaim: boolean;
  rewardClaimed: boolean;
}

export interface FactionShopView {
  id: string;
  factionId: FactionId;
  itemId: string;
  quantity: number;
  label: string;
  requiredRankId: string;
  requiredRankLabel: string;
  costEclats: number;
  weeklyLimit: number;
  purchasedThisWeek: number;
  canPurchase: boolean;
  locked: boolean;
}

export interface FactionCampaignLeaderboardEntry {
  rank: number;
  characterName: string;
  classId: string;
  points: number;
  isMe: boolean;
}

export interface FactionCampaignLeaderboard {
  entries: FactionCampaignLeaderboardEntry[];
  myRank: number | null;
  myPoints: number;
}

interface FactionsUIProps {
  loading?: boolean;
  weekKey: string;
  eclats: number;
  pledgedFactionId: FactionId | null;
  factions: FactionSummary[];
  quests: FactionQuestView[];
  shopItems: FactionShopView[];
  campaigns?: FactionCampaignView[];
  campaignLeaderboards?: Partial<Record<FactionId, FactionCampaignLeaderboard>>;
  message?: string;
  cosmetics?: { titles: string[]; frames: string[]; equippedTitle?: string | null; equippedFrame?: string | null };
  onPledge: (factionId: FactionId) => Promise<void>;
  onClaimQuest: (questProgressId: string) => Promise<void>;
  onPurchase: (shopItemId: string) => Promise<void>;
  onClaimCampaign?: (factionId: FactionId) => Promise<void>;
  onEquipCosmetic?: (cosmeticId: string | null, slot: "title" | "frame") => Promise<void>;
}

export function FactionsUI({
  loading,
  weekKey,
  eclats,
  pledgedFactionId,
  factions,
  quests,
  shopItems,
  campaigns = [],
  campaignLeaderboards,
  message,
  cosmetics,
  onPledge,
  onClaimQuest,
  onPurchase,
  onClaimCampaign,
  onEquipCosmetic,
}: FactionsUIProps) {
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<FactionTab>("reputation");
  const [selectedFaction, setSelectedFaction] = useState<FactionId>(pledgedFactionId ?? "lumina");
  const [busy, setBusy] = useState(false);

  const faction = factions.find((f) => f.factionId === selectedFaction);
  const factionQuests = quests.filter((q) => q.factionId === selectedFaction);
  const factionShop = shopItems.filter((s) => s.factionId === selectedFaction);
  const factionCampaign = campaigns.find((c) => c.factionId === selectedFaction);
  const campaignLeaderboard = campaignLeaderboards?.[selectedFaction] ?? null;

  const meetsRank = (currentRankId: string, requiredRankId: string) => {
    const order = ["stranger", "known", "ally", "champion", "exalted"];
    return order.indexOf(currentRankId) >= order.indexOf(requiredRankId);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900">
      <div className="p-4 flex items-center gap-3 border-b border-aether-800">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-white">Factions</h1>
          <p className="text-aether-500 text-xs">Semaine {weekKey} • ✦ {eclats}</p>
        </div>
        <button
          type="button"
          onClick={() => setScreen("territory-overview")}
          className="text-aether-400 text-xs px-2 py-1 rounded-lg border border-aether-700 hover:border-aether-500"
        >
          🗺️ Carte
        </button>
      </div>

      <div className="flex gap-1 p-2 border-b border-aether-800">
        {([
          ["reputation", "Réputation"],
          ["quests", "Quêtes"],
          ["shop", "Boutique"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-xs rounded-lg font-semibold ${
              tab === id ? "bg-aether-700 text-white" : "text-aether-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-2">
        {(["lumina", "umbra", "neutre"] as const).map((id) => {
          const meta = FACTION_META[id];
          return (
            <button
              key={id}
              onClick={() => setSelectedFaction(id)}
              className={`flex-1 py-2 rounded-lg text-xs ${
                selectedFaction === id
                  ? "bg-crystal-gold/20 border border-crystal-gold/40 text-white"
                  : "bg-aether-900/60 text-aether-400"
              }`}
            >
              {meta.icon} {id === "neutre" ? "Neutre" : id === "lumina" ? "Lumina" : "Umbra"}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="mx-4 text-green-400 text-xs">{message}</p>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-aether-500 text-sm text-center">Chargement…</p>
        ) : tab === "reputation" && faction ? (
          <>
            <div className="card">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{faction.icon}</span>
                <div>
                  <h2 className="text-white font-bold">{faction.name}</h2>
                  <p className="text-aether-400 text-xs">{faction.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-crystal-gold text-sm">{faction.rankIcon} {faction.rankLabel}</span>
                <span className="text-aether-500 text-xs">{faction.reputation} réputation</span>
              </div>
              {faction.nextRankLabel && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-aether-500 mb-1">
                    <span>→ {faction.nextRankLabel}</span>
                    <span>{faction.pointsToNext} pts</span>
                  </div>
                  <div className="h-2 bg-aether-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-crystal-gold to-crystal-cyan"
                      style={{ width: `${faction.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
              {faction.isPledged ? (
                <p className="text-crystal-gold text-xs mt-3">★ Faction alliée — +50 % réputation sur les quêtes</p>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => run(() => onPledge(faction.factionId))}
                  className="btn-primary w-full mt-3 text-sm"
                >
                  Prêter allégeance (+25 réputation)
                </button>
              )}
            </div>

            {factionCampaign && (
              <div className="card border border-aether-600/40">
                <h3 className="text-aether-300 text-sm font-semibold mb-1">Campagne hebdomadaire</h3>
                <p className="text-white text-sm font-medium">{factionCampaign.name}</p>
                <p className="text-aether-500 text-xs mt-1">{factionCampaign.description}</p>
                <div className="mt-2 h-2 bg-aether-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-aether-500 to-crystal-cyan"
                    style={{ width: `${factionCampaign.progressPercent}%` }}
                  />
                </div>
                <p className="text-aether-500 text-[10px] mt-1">
                  {factionCampaign.progress}/{factionCampaign.target} pts communautaires • Vous : {factionCampaign.myPoints} pts
                </p>
                {factionCampaign.status === "completed" && !factionCampaign.rewardClaimed && (
                  <p className="text-green-400 text-xs mt-2">Campagne réussie ! Réclamez votre récompense.</p>
                )}
                {factionCampaign.canClaim && onClaimCampaign && (
                  <button
                    disabled={busy}
                    onClick={() => run(() => onClaimCampaign(selectedFaction))}
                    className="btn-primary w-full mt-2 text-xs"
                  >
                    Réclamer (+{factionCampaign.rewardReputation} rép. • +{factionCampaign.rewardEclats} ✦)
                  </button>
                )}
                {factionCampaign.rewardClaimed && (
                  <p className="text-green-400 text-xs mt-2">✓ Récompense de campagne réclamée</p>
                )}
              </div>
            )}

            {campaignLeaderboard && (
              <div className="card border border-aether-600/30">
                <h3 className="text-aether-300 text-sm font-semibold mb-2">Classement contributeurs</h3>
                <p className="text-aether-500 text-[10px] mb-2">
                  🥇 {getCosmeticById(CAMPAIGN_RANK_REWARDS[1]?.title ?? "")?.name ?? "Héros"} + cadre or •
                  🥈 cadre argent • 🥉 cadre bronze
                </p>
                {campaignLeaderboard.entries.length === 0 ? (
                  <p className="text-aether-500 text-xs">Aucun contributeur cette semaine.</p>
                ) : (
                  <div className="space-y-1">
                    {campaignLeaderboard.entries.map((entry) => {
                      const cls = CLASSES.find((c) => c.id === entry.classId);
                      return (
                        <div
                          key={`${entry.rank}-${entry.characterName}`}
                          className={`flex items-center justify-between text-xs p-1.5 rounded ${
                            entry.isMe ? "bg-crystal-gold/10 border border-crystal-gold/30" : "bg-aether-900/40"
                          }`}
                        >
                          <span className="text-white">
                            #{entry.rank} {cls?.icon} {entry.characterName}
                            {entry.isMe && <span className="text-crystal-gold ml-1">(vous)</span>}
                          </span>
                          <span className="text-aether-400">{entry.points} pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {campaignLeaderboard.myRank && (
                  <p className="text-aether-500 text-[10px] mt-2">
                    Votre rang : #{campaignLeaderboard.myRank} • {campaignLeaderboard.myPoints} pts
                  </p>
                )}
              </div>
            )}

            <div className="card">
              <h3 className="text-aether-300 text-sm font-semibold mb-2">Récompenses de rang</h3>
              <div className="space-y-2 text-xs">
                {(["champion", "exalted"] as const).map((rankId) => {
                  const rank = FACTION_RANKS.find((r) => r.id === rankId);
                  const rewardIds = FACTION_RANK_COSMETICS[selectedFaction]?.[rankId] ?? [];
                  const unlocked = faction && meetsRank(faction.rank, rankId);
                  return (
                    <div key={rankId} className={`p-2 rounded-lg ${unlocked ? "bg-crystal-gold/10 border border-crystal-gold/30" : "bg-aether-900/40"}`}>
                      <p className="text-white font-medium">{rank?.icon} {rank?.label}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rewardIds.map((id) => {
                          const cosmetic = getCosmeticById(id);
                          const owned = cosmetics?.titles.includes(id) || cosmetics?.frames.includes(id);
                          const equipped = cosmetics?.equippedTitle === id || cosmetics?.equippedFrame === id;
                          return (
                            <button
                              key={id}
                              disabled={!owned || !onEquipCosmetic || busy}
                              onClick={() => {
                                if (!onEquipCosmetic || !cosmetic) return;
                                const slot = cosmetic.type === "title" ? "title" : "frame";
                                void run(() => onEquipCosmetic(equipped ? null : id, slot));
                              }}
                              className={`px-2 py-1 rounded text-[10px] ${
                                owned ? "bg-aether-800 text-white" : "bg-aether-950 text-aether-600"
                              } ${equipped ? "ring-1 ring-crystal-gold" : ""}`}
                            >
                              {cosmetic?.icon} {cosmetic?.name ?? id}
                              {equipped ? " ✓" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="text-aether-300 text-sm font-semibold mb-2">Toutes les factions</h3>
              <div className="space-y-2">
                {factions.map((f) => (
                  <button
                    key={f.factionId}
                    onClick={() => setSelectedFaction(f.factionId)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-aether-900/40"
                  >
                    <span className="text-white text-sm">{f.icon} {f.name}</span>
                    <span className="text-aether-400 text-xs">{f.rankIcon} {f.reputation}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : tab === "quests" ? (
          factionQuests.map((q) => (
            <div key={q.questId} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white text-sm font-semibold">{q.label}</p>
                  <p className="text-aether-500 text-xs mt-1">{q.description}</p>
                </div>
                {q.claimed && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <div className="mt-2 h-1.5 bg-aether-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-aether-500"
                  style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                />
              </div>
              <p className="text-aether-500 text-[10px] mt-1">
                {q.progress}/{q.target} • +{q.rewardReputation} rép. • +{q.rewardEclats} ✦
              </p>
              {q.completed && !q.claimed && q._id && (
                <button
                  disabled={busy}
                  onClick={() => run(() => onClaimQuest(q._id!))}
                  className="btn-primary w-full mt-2 text-xs"
                >
                  Réclamer
                </button>
              )}
              {q.completed && !q.claimed && !q._id && (
                <p className="text-aether-500 text-[10px] mt-2">Synchronisation…</p>
              )}
            </div>
          ))
        ) : (
          factionShop.map((item) => {
            const def = getItemById(item.itemId);
            return (
              <div key={item.id} className={`card ${item.locked ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{def?.icon ?? "📦"}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    <p className="text-aether-500 text-[10px]">
                      Rang {item.requiredRankLabel} • {item.costEclats} ✦
                    </p>
                    <p className="text-aether-600 text-[10px]">
                      {item.purchasedThisWeek}/{item.weeklyLimit} cette semaine
                    </p>
                  </div>
                </div>
                <button
                  disabled={busy || !item.canPurchase}
                  onClick={() => run(() => onPurchase(item.id))}
                  className="btn-secondary w-full mt-2 text-xs"
                >
                  {item.locked ? "Rang insuffisant" : item.canPurchase ? "Acheter" : "Indisponible"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
