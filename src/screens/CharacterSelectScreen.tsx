import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CLASSES } from "../game/data";
import { getClassPortrait, ROSTER_ART } from "../game/data/assets";
import { isCloudAccount, isConvexEnabled } from "../lib/convexUtils";
import { cacheConvexCharacter } from "../lib/convexBridge";

interface SavedCharacter {
  id: string;
  name: string;
  classId: string;
  level: number;
  zoneId?: string;
}

function getLocalCharacters(accountId: string): SavedCharacter[] {
  try {
    return JSON.parse(localStorage.getItem(`aetheris-chars-${accountId}`) ?? "[]");
  } catch {
    return [];
  }
}

function CharacterList({ characters, loading }: { characters: SavedCharacter[]; loading?: boolean }) {
  const username = useGameStore((s) => s.username);
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setScreen = useGameStore((s) => s.setScreen);
  const setZone = useGameStore((s) => s.setZone);
  const accountId = useGameStore((s) => s.accountId)!;

  const selectCharacter = (char: SavedCharacter) => {
    setCharacter(char.id, char.name, char.classId);
    if (char.zoneId) setZone(char.zoneId);
    setScreen("world");
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900 p-6">
      <div className="text-center mb-6">
        <img
          src={ROSTER_ART}
          alt="Les Éveilleurs d'Aetheris"
          className="w-full max-h-32 object-cover rounded-xl border border-aether-700/50 mb-4"
        />
        <h1 className="font-display text-2xl font-bold text-aether-200">Choisissez votre Éveilleur</h1>
        <p className="text-aether-400 text-sm mt-1">Bienvenue, {username}</p>
        <p className="text-aether-500 text-xs mt-1">
          {isCloudAccount(accountId) ? "☁️ Terreval en ligne" : "🏠 Mode sanctuaire"}
        </p>
      </div>
      <div className="flex-1 space-y-3 max-w-md mx-auto w-full overflow-y-auto">
        {loading && <p className="text-aether-400 text-center text-sm">Chargement...</p>}
        {characters.map((char) => {
          const portrait = getClassPortrait(char.classId);
          return (
          <button
            key={char.id}
            onClick={() => selectCharacter(char)}
            className="card w-full flex items-center gap-4 hover:border-aether-500 active:scale-[0.98]"
          >
            {portrait ? (
              <img src={portrait} alt="" className="w-12 h-12 rounded-lg object-cover border border-aether-600/50" />
            ) : (
              <div className="text-3xl">{CLASSES.find((c) => c.id === char.classId)?.icon ?? "🧙"}</div>
            )}
            <div className="text-left flex-1">
              <p className="font-bold text-white">{char.name}</p>
              <p className="text-aether-400 text-sm">Niveau {char.level}</p>
            </div>
          </button>
        );
        })}
        {characters.length < 5 && (
          <button
            onClick={() => setScreen("character-create")}
            className="card w-full flex justify-center gap-2 border-dashed py-6"
          >
            <span className="text-2xl">+</span>
            <span className="text-aether-300">Créer un personnage</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CloudSelect() {
  const accountId = useGameStore((s) => s.accountId)!;
  const cloudChars = useQuery(api.characters.getCharactersByAccount, {
    accountId: accountId as Id<"accounts">,
  });
  const characters = (cloudChars ?? []).map((c) => ({
    id: c._id, name: c.name, classId: c.classId, level: c.level, zoneId: c.zoneId,
  }));
  return <CharacterList characters={characters} loading={cloudChars === undefined} />;
}

function LocalSelect() {
  const accountId = useGameStore((s) => s.accountId)!;
  return <CharacterList characters={getLocalCharacters(accountId)} />;
}

export default function CharacterSelectScreen() {
  const accountId = useGameStore((s) => s.accountId)!;
  return isCloudAccount(accountId) && isConvexEnabled() ? <CloudSelect /> : <LocalSelect />;
}

export function CloudCharacterSync({ characterId }: { characterId: string }) {
  const doc = useQuery(api.characters.getCharacter, {
    characterId: characterId as Id<"characters">,
  });
  const syncProgression = useMutation(api.characters.syncCharacterProgression);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (doc && !syncedRef.current) {
      syncedRef.current = true;
      void syncProgression({ characterId: characterId as Id<"characters"> });
    }
  }, [characterId, doc, syncProgression]);

  if (doc) cacheConvexCharacter(doc as Record<string, unknown>);
  return null;
}
