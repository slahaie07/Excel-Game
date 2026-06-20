import { getItemById } from "../game/data";

export interface MarketplaceListing {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  seller: string;
}

interface MarketplaceUIProps {
  eclats: number;
  tab: "buy" | "sell";
  onTabChange: (tab: "buy" | "sell") => void;
  listings: MarketplaceListing[];
  sellableItems: { itemId: string; quantity: number }[];
  loading?: boolean;
  onBuy: (listing: MarketplaceListing) => void;
  onSell: (itemId: string, quantity: number) => void;
  onBack: () => void;
}

export function MarketplaceUI({
  eclats,
  tab,
  onTabChange,
  listings,
  sellableItems,
  loading,
  onBuy,
  onSell,
  onBack,
}: MarketplaceUIProps) {
  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={onBack} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Marché d&apos;Halan</h1>
        <span className="ml-auto text-crystal-gold text-sm">✦ {eclats}</span>
        {loading && <span className="text-aether-500 text-xs ml-2">Sync...</span>}
      </div>

      <div className="flex border-b border-aether-700/40">
        {(["buy", "sell"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
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
                    onClick={() => onBuy(listing)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    ✦ {listing.price}
                  </button>
                </div>
              );
            })
          )
        ) : sellableItems.length === 0 ? (
          <p className="text-aether-500 text-sm text-center py-8">Aucune ressource à vendre</p>
        ) : (
          sellableItems.map((inv) => {
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
                  onClick={() => onSell(inv.itemId, 1)}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  Vendre
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
