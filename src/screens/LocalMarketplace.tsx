import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { getItemById } from "../game/data";
import { loadCharacter } from "../lib/characterStorage";
import { MarketplaceUI } from "./MarketplaceUI";

export default function LocalMarketplace() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [refresh, setRefresh] = useState(0);

  const listingsKey = "aetheris-marketplace";
  const listings = JSON.parse(localStorage.getItem(listingsKey) ?? "[]") as {
    id: string; itemId: string; quantity: number; price: number; seller: string;
  }[];

  const charData = loadCharacter(characterId) ?? { eclats: 0, inventory: [], name: "Joueur" };

  const buyItem = (listing: typeof listings[0]) => {
    if ((charData.eclats ?? 0) < listing.price) return;

    const inventory = [...(charData.inventory ?? [])];
    const existing = inventory.find((i) => i.itemId === listing.itemId);
    if (existing) existing.quantity += listing.quantity;
    else inventory.push({ itemId: listing.itemId, quantity: listing.quantity });

    charData.eclats = (charData.eclats ?? 0) - listing.price;
    charData.inventory = inventory;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));

    const updated = listings.filter((l) => l.id !== listing.id);
    localStorage.setItem(listingsKey, JSON.stringify(updated));
    setRefresh((r) => r + 1);
  };

  const sellableItems = (charData.inventory ?? []).filter((inv) => {
    const item = getItemById(inv.itemId);
    return item && item.type === "resource";
  });

  const sellItem = (itemId: string, quantity: number) => {
    const item = getItemById(itemId);
    if (!item) return;

    const listing = {
      id: `listing_${Date.now()}`,
      itemId,
      quantity,
      price: item.sellPrice * quantity,
      seller: charData.name ?? "Joueur",
    };

    localStorage.setItem(listingsKey, JSON.stringify([...listings, listing]));

    const inventory = (charData.inventory ?? []).map((i) =>
      i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
    ).filter((i) => i.quantity > 0);

    charData.inventory = inventory;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
    setRefresh((r) => r + 1);
  };

  void refresh;

  return (
    <MarketplaceUI
      eclats={charData.eclats ?? 0}
      tab={tab}
      onTabChange={setTab}
      listings={listings}
      sellableItems={sellableItems}
      onBuy={buyItem}
      onSell={sellItem}
      onBack={() => setScreen("world")}
    />
  );
}
