import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { CLASSES } from "../game/data";

export default function CloudFriends() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setTradePartner = useGameStore((s) => s.setTradePartner);
  const [searchName, setSearchName] = useState("");
  const [error, setError] = useState("");

  const friends = useQuery(api.friends.listFriends, { characterId: characterId as Id<"characters"> });
  const searchResult = useQuery(
    api.friends.searchCharacterByName,
    searchName.length >= 2 ? { name: searchName } : "skip"
  );
  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriend = useMutation(api.friends.acceptFriend);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Amis ☁️</h1>
      </div>
      <div className="p-4 border-b border-aether-700/40 flex gap-2">
        <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Nom exact" className="flex-1 bg-aether-900 border border-aether-700 rounded-xl px-3 py-2 text-sm text-white" />
        <button
          onClick={async () => {
            if (!searchResult) { setError("Introuvable"); return; }
            try {
              await sendRequest({ characterId: characterId as Id<"characters">, friendId: searchResult._id });
              setError("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur");
            }
          }}
          className="btn-secondary text-sm px-4"
        >
          Ajouter
        </button>
      </div>
      {error && <p className="text-red-400 text-xs px-4">{error}</p>}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(friends ?? []).map((f) => {
          const cls = CLASSES.find((c) => c.id === f.classId);
          return (
            <div key={f.friendId} className="card flex items-center gap-3">
              <span className="text-2xl">{cls?.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{f.name}</p>
                <p className="text-aether-500 text-xs">Niv. {f.level}</p>
              </div>
              {f.status === "accepted" && !f.isIncoming && (
                <button
                  onClick={() => {
                    setTradePartner(f.friendId);
                    setScreen("trade");
                  }}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Échanger
                </button>
              )}
              {f.isIncoming && f.status === "pending" && (
                <button
                  onClick={() => void acceptFriend({ characterId: characterId as Id<"characters">, friendId: f.friendId })}
                  className="btn-primary text-xs py-1 px-2"
                >
                  Accepter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
