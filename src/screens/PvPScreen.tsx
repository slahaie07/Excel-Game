import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { CLASSES } from "../game/data";
import {
  loadCharacter,
  loadPvpRecord,
  savePvpRecord,
} from "../lib/characterStorage";

const OPPONENT_NAMES = [
  "ShadowKael", "LunaStrike", "CrystalFury", "EtherBlade",
  "NebulaWolf", "StarBane", "VoidWalker", "AetherKnight",
];

const OPPONENT_CLASSES = ["pyromancien", "gardien", "eclaireur", "archer", "berserker", "alchimiste"];

export default function PvPScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setPvpMode = useGameStore((s) => s.setPvpMode);

  const [mode, setMode] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const char = loadCharacter(characterId);
  const record = loadPvpRecord(characterId);
  const classData = CLASSES.find((c) => c.id === classId);

  const startMatchmaking = () => {
    if ((char?.level ?? 1) < 10) {
      setError("Niveau 10 requis pour l'arène PvP");
      return;
    }
    setError("");
    setSearching(true);

    setTimeout(() => {
      const opponentName = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)]!;
      const opponentClass = OPPONENT_CLASSES[Math.floor(Math.random() * OPPONENT_CLASSES.length)]!;
      const opponentLevel = (char?.level ?? 10) + Math.floor(Math.random() * 5) - 2;

      const combatId = `pvp_${Date.now()}`;
      localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
        type: "pvp",
        mode,
        monsterIds: [],
        pvpOpponent: {
          name: opponentName,
          classId: opponentClass,
          level: Math.max(10, opponentLevel),
        },
        zoneId: "arene_pvp",
        characterId,
      }));

      setPvpMode(mode);
      setSearching(false);
      setCombat(combatId);
    }, 1500 + Math.random() * 2000);
  };

  const leaderboard = JSON.parse(localStorage.getItem("aetheris-pvp-leaderboard") ?? "[]") as {
    name: string; rating: number; wins: number; classId: string;
  }[];

  if (leaderboard.length === 0) {
    leaderboard.push(
      { name: characterName, rating: record.rating, wins: record.wins, classId },
      { name: "ShadowKael", rating: 1450, wins: 89, classId: "pyromancien" },
      { name: "LunaStrike", rating: 1380, wins: 72, classId: "archer" },
      { name: "CrystalFury", rating: 1320, wins: 65, classId: "gardien" },
      { name: "EtherBlade", rating: 1280, wins: 58, classId: "eclaireur" },
    );
    localStorage.setItem("aetheris-pvp-leaderboard", JSON.stringify(leaderboard));
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-red-950/20">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">⚔️ Arène PvP</h1>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Stats joueur */}
        <div className="card flex items-center gap-4">
          <span className="text-3xl">{classData?.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-white">{characterName}</p>
            <p className="text-aether-400 text-sm">Rating : {record.rating}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-green-400">{record.wins}V</p>
            <p className="text-red-400">{record.losses}D</p>
            {record.streak > 0 && <p className="text-crystal-gold">🔥 {record.streak}</p>}
          </div>
        </div>

        {/* Mode sélection */}
        <div>
          <h2 className="text-aether-400 text-sm mb-2">Mode de combat</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["1v1", "2v2", "3v3"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`card py-3 text-center ${mode === m ? "border-red-500 ring-2 ring-red-500/30" : ""}`}
              >
                <p className="font-bold text-white">{m}</p>
                <p className="text-aether-500 text-xs">
                  {m === "1v1" ? "Duel" : m === "2v2" ? "Équipe" : "Groupe"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={startMatchmaking}
          disabled={searching}
          className="btn-primary w-full bg-gradient-to-r from-red-700 to-red-500 disabled:opacity-60"
        >
          {searching ? "Recherche d'adversaire..." : `Lancer un ${mode}`}
        </button>

        {/* Classement */}
        <div>
          <h2 className="text-aether-400 text-sm mb-2">Classement</h2>
          {leaderboard
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
            .map((entry, i) => {
              const cls = CLASSES.find((c) => c.id === entry.classId);
              return (
                <div key={entry.name} className={`card mb-1 flex items-center gap-3 py-2 ${entry.name === characterName ? "border-aether-500" : ""}`}>
                  <span className="text-aether-500 w-6 text-center font-bold">#{i + 1}</span>
                  <span className="text-lg">{cls?.icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{entry.name}</p>
                    <p className="text-aether-500 text-xs">{entry.wins} victoires</p>
                  </div>
                  <span className="text-crystal-gold font-bold text-sm">{entry.rating}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// Export for combat screen to update PvP record
export function applyPvpResult(characterId: string, won: boolean) {
  const record = loadPvpRecord(characterId);
  if (won) {
    record.wins++;
    record.streak++;
    record.rating += Math.max(10, 25 + record.streak * 2);
  } else {
    record.losses++;
    record.streak = 0;
    record.rating = Math.max(0, record.rating - 15);
  }
  savePvpRecord(characterId, record);
}
