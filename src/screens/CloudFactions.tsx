import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { FactionsUI } from "./FactionsUI";

export default function CloudFactions() {
  const characterId = useGameStore((s) => s.characterId)!;
  const initHub = useMutation(api.factions.initFactionHub);
  const pledgeFaction = useMutation(api.factions.pledgeFaction);
  const claimQuest = useMutation(api.factions.claimFactionQuest);
  const purchaseItem = useMutation(api.factions.purchaseFactionItem);
  const claimCampaign = useMutation(api.factionCampaigns.claimFactionCampaignReward);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const equipCosmetic = useMutation(api.cosmetics.equipCosmetic);
  const myCosmetics = useQuery(
    api.cosmetics.getMyCosmetics,
    ready ? { characterId: characterId as Id<"characters"> } : "skip"
  );

  useEffect(() => {
    void initHub({ characterId: characterId as Id<"characters"> }).then(() => setReady(true));
  }, [characterId, initHub]);

  const hub = useQuery(
    api.factions.getFactionHub,
    ready ? { characterId: characterId as Id<"characters"> } : "skip"
  );
  const campaigns = useQuery(
    api.factionCampaigns.getFactionCampaigns,
    ready ? { characterId: characterId as Id<"characters"> } : "skip"
  );

  return (
    <FactionsUI
      loading={!ready || hub === undefined}
      weekKey={hub?.weekKey ?? "—"}
      eclats={hub?.eclats ?? 0}
      pledgedFactionId={hub?.pledgedFactionId ?? null}
      factions={hub?.factions ?? []}
      quests={(hub?.quests ?? []).map((q) => ({ ...q, _id: q._id ?? null }))}
      shopItems={hub?.shopItems ?? []}
      campaigns={campaigns?.campaigns ?? []}
      message={message}
      cosmetics={myCosmetics ?? undefined}
      onPledge={async (factionId) => {
        await pledgeFaction({ characterId: characterId as Id<"characters">, factionId });
        setMessage(`Allégeance prêtée à ${factionId} !`);
      }}
      onClaimQuest={async (questProgressId) => {
        const result = await claimQuest({
          characterId: characterId as Id<"characters">,
          questProgressId: questProgressId as Id<"factionQuestProgress">,
        });
        const bonus = result.bonusReputation > 0 ? ` (+${result.bonusReputation} bonus)` : "";
        setMessage(`+${result.reputation} réputation${bonus} • +${result.eclats} ✦`);
      }}
      onPurchase={async (shopItemId) => {
        const result = await purchaseItem({
          characterId: characterId as Id<"characters">,
          shopItemId,
        });
        setMessage(`Acheté : ${result.quantity}× ${result.itemId} (−${result.costEclats} ✦)`);
      }}
      onEquipCosmetic={async (cosmeticId, slot) => {
        await equipCosmetic({
          characterId: characterId as Id<"characters">,
          cosmeticId,
          slot,
        });
        setMessage(cosmeticId ? "Cosmétique équipé !" : "Cosmétique retiré");
      }}
      onClaimCampaign={async (factionId) => {
        const result = await claimCampaign({
          characterId: characterId as Id<"characters">,
          factionId,
        });
        setMessage(`Campagne réussie ! +${result.reputation} rép. • +${result.eclats} ✦`);
      }}
    />
  );
}
