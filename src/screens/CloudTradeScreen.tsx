import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { getItemById } from "../game/data";

export default function CloudTradeScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const tradePartnerId = useGameStore((s) => s.tradePartnerId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setTradePartner = useGameStore((s) => s.setTradePartner);

  const session = useQuery(api.trade.getActiveTrade, { characterId });
  const startTrade = useMutation(api.trade.startTrade);
  const updateOffer = useMutation(api.trade.updateTradeOffer);
  const confirmTrade = useMutation(api.trade.confirmTrade);
  const cancelTrade = useMutation(api.trade.cancelTrade);

  const [eclats, setEclats] = useState(0);
  const [itemId, setItemId] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const character = useQuery(api.characters.getCharacter, { characterId });

  const isInitiator = session?.initiatorId === characterId;
  const myOffer = isInitiator ? session?.initiatorOffer : session?.partnerOffer;
  const theirOffer = isInitiator ? session?.partnerOffer : session?.initiatorOffer;
  const myConfirmed = isInitiator ? session?.initiatorConfirmed : session?.partnerConfirmed;
  const theirConfirmed = isInitiator ? session?.partnerConfirmed : session?.initiatorConfirmed;
  const partnerName = isInitiator ? session?.partnerName : session?.initiatorName;

  useEffect(() => {
    if (session?.status === "completed") setSuccess(true);
  }, [session?.status]);

  const tradeStep = !session ? 1 : myConfirmed && theirConfirmed ? 3 : 2;

  const beginTrade = async () => {
    if (!tradePartnerId) return;
    try {
      await startTrade({ initiatorId: characterId, partnerId: tradePartnerId as Id<"characters"> });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const submitOffer = async () => {
    if (!session) return;
    try {
      await updateOffer({
        sessionId: session._id,
        characterId,
        eclats,
        items: itemId ? [{ itemId, quantity: itemQty }] : [],
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => { setTradePartner(null); setScreen("friends"); }} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Échange ☁️</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {success ? (
          <div className="card text-center py-8">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-white font-bold">Échange réussi !</p>
            <button
              onClick={() => { setTradePartner(null); setScreen("friends"); }}
              className="btn-primary w-full mt-4"
            >
              Retour aux amis
            </button>
          </div>
        ) : (
          <>
        <div className="flex justify-center gap-2 text-[10px]">
          {["Proposer", "Négocier", "Confirmer"].map((label, i) => (
            <span
              key={label}
              className={`px-2 py-1 rounded ${tradeStep === i + 1 ? "bg-aether-700 text-white" : "text-aether-600"}`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {!session && tradePartnerId && (
          <button onClick={() => void beginTrade()} className="btn-primary w-full">
            Proposer un échange
          </button>
        )}

        {session && (
          <>
            <p className="text-aether-400 text-sm text-center">Avec {partnerName}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="card">
                <p className="text-aether-500 text-xs mb-2">Votre offre</p>
                <p className="text-white text-sm">✦ {myOffer?.eclats ?? 0}</p>
                {(myOffer?.items ?? []).map((i) => {
                  const item = getItemById(i.itemId);
                  return (
                    <p key={i.itemId} className="text-aether-400 text-xs">
                      {item?.name ?? i.itemId} x{i.quantity}
                    </p>
                  );
                })}
                {myConfirmed && <p className="text-green-400 text-xs mt-1">✓ Confirmé</p>}
              </div>
              <div className="card">
                <p className="text-aether-500 text-xs mb-2">Leur offre</p>
                <p className="text-white text-sm">✦ {theirOffer?.eclats ?? 0}</p>
                {(theirOffer?.items ?? []).map((i) => {
                  const item = getItemById(i.itemId);
                  return (
                    <p key={i.itemId} className="text-aether-400 text-xs">
                      {item?.name ?? i.itemId} x{i.quantity}
                    </p>
                  );
                })}
                {theirConfirmed && <p className="text-green-400 text-xs mt-1">✓ Confirmé</p>}
              </div>
            </div>

            <div className="card space-y-2">
              <p className="text-aether-500 text-xs">Vos éclats : ✦ {character?.eclats ?? 0}</p>
              <input
                type="number"
                value={eclats}
                onChange={(e) => setEclats(Number(e.target.value))}
                placeholder="Éclats"
                className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="ID objet (optionnel)"
                className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              {(character?.inventory ?? []).length > 0 && (
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">— Choisir dans l'inventaire —</option>
                  {character!.inventory.map((inv) => {
                    const item = getItemById(inv.itemId);
                    return (
                      <option key={inv.itemId} value={inv.itemId}>
                        {item?.name ?? inv.itemId} (x{inv.quantity})
                      </option>
                    );
                  })}
                </select>
              )}
              <input
                type="number"
                value={itemQty}
                onChange={(e) => setItemQty(Number(e.target.value))}
                placeholder="Quantité"
                className="w-full bg-aether-950 border border-aether-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <button onClick={() => void submitOffer()} className="btn-secondary w-full text-sm">
                Mettre à jour l'offre
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => void (async () => {
                  const otherConfirmed = isInitiator ? session.partnerConfirmed : session.initiatorConfirmed;
                  await confirmTrade({ sessionId: session._id, characterId });
                  if (otherConfirmed) setSuccess(true);
                })()}
                className="btn-primary flex-1 text-sm"
              >
                {theirConfirmed ? "Finaliser l'échange" : "Confirmer"}
              </button>
              <button
                onClick={() => void cancelTrade({ sessionId: session._id, characterId }).then(() => setScreen("friends"))}
                className="btn-secondary flex-1 text-sm"
              >
                Annuler
              </button>
            </div>
          </>
        )}
          </>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
