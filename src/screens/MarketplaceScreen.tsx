import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { getItemById } from "../game/data";

export default function MarketplaceScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  const listingsKey = "aetheris-marketplace";
  const listings: { id: string; itemId: string; quantity: number; price: number; seller: string }[] =
    JSON.parse(localStorage.getItem(listingsKey) ?? "[]");

  const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");

  const buyItem = (listing: typeof listings[0]) => {
    if ((charData.eclats ?? 0) < listing.price) return;

    const inventory = charData.inventory ?? [];
    const existing = inventory.find((i: { itemId: string }) => i.itemId === listing.itemId);
    if (existing) existing.quantity += listing.quantity;
    else inventory.push({ itemId: listing.itemId, quantity: listing.quantity });

    charData.eclats -= listing.price;
    charData.inventory = inventory;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));

    const updated = listings.filter((l) => l.id !== listing.id);
    localStorage.setItem(listingsKey, JSON.stringify(updated));
    window.location.reload();
  };

  const sellableItems = (charData.inventory ?? []).filter(
    (inv: { itemId: string }) => {
      const item = getItemById(inv.itemId);
      return item && item.type === "resource";
    }
  );

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

    const inventory = charData.inventory.map((i: { itemId: string; quantity: number }) =>
      i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
    ).filter((i: { quantity: number }) => i.quantity > 0);

    charData.inventory = inventory;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Marché d&apos;Halan</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {charData.eclats ?? 0}</span>
      </div>

      <div className="flex border-b border-aether-700/40">
        {(["buy", "sell"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold ${
              tab === t ? "text-aether-300 border-b-2 border-aether-500" : "text-aether-500"
            }`}
          >
            {t === "buy" ? "Acheter" : "Vendre"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "buy" ? (
          listings.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-8">Aucune annonce pour le moment</p>
          ) : (
            listings.map((listing) => {
              const item = getItemById(listing.itemId);
              if (!item) return null;
              return (
                <div key={listing.id} className="card mb-2 flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{item.name} x{listing.quantity}</p>
                    <p className="text-aether-500 text-xs">Vendeur : {listing.seller}</p>
                  </div>
                  <button
                    onClick={() => buyItem(listing)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    ✦ {listing.price}
                  </button>
                </div>
              );
            })
          )
        ) : (
          sellableItems.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-8">Aucune ressource à vendre</p>
          ) : (
            sellableItems.map((inv: { itemId: string; quantity: number }) => {
              const item = getItemById(inv.itemId);
              if (!item) return null;
              return (
                <div key={inv.itemId} className="card mb-2 flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{item.name} x{inv.quantity}</p>
                    <p className="text-crystal-gold text-xs">✦ {item.sellPrice}/unité</p>
                  </div>
                  <button
                    onClick={() => sellItem(inv.itemId, 1)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Vendre
                  </button>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
