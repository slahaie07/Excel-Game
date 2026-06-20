import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getItemById } from "../game/data";
import { loadCharacter } from "../lib/characterStorage";
import { cacheConvexCharacter } from "../lib/convexBridge";
import { MarketplaceUI } from "./MarketplaceUI";

export default function CloudMarketplace() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const listings = useQuery(api.social.listListing, {});
  const createListing = useMutation(api.social.createListing);
  const buyListing = useMutation(api.social.buyListing);

  const char = cloudChar ? cacheConvexCharacter(cloudChar as Record<string, unknown>) : loadCharacter(characterId);

  const mappedListings = (listings ?? []).map((l: {
    _id: string; itemId: string; quantity: number; pricePerUnit: number; sellerId: string;
  }) => ({
    id: l._id,
    itemId: l.itemId,
    quantity: l.quantity,
    price: l.pricePerUnit * l.quantity,
    seller: l.sellerId.slice(-6),
  }));

  const sellableItems = (char?.inventory ?? []).filter((inv) => {
    const item = getItemById(inv.itemId);
    return item && item.type === "resource";
  });

  return (
    <MarketplaceUI
      eclats={char?.eclats ?? 0}
      tab={tab}
      onTabChange={setTab}
      listings={mappedListings}
      sellableItems={sellableItems}
      loading={cloudChar === undefined || listings === undefined}
      onBuy={async (listing) => {
        await buyListing({
          listingId: listing.id as Id<"marketplace">,
          buyerId: characterId,
          quantity: listing.quantity,
        });
      }}
      onSell={async (itemId, quantity) => {
        const item = getItemById(itemId);
        if (!item) return;
        await createListing({
          sellerId: characterId,
          itemId,
          quantity,
          pricePerUnit: item.sellPrice,
        });
      }}
      onBack={() => setScreen("world")}
    />
  );
}
