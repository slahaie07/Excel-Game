import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import {
  loadCharacter,
  loadPvpRecord,
  savePvpRecord,
} from "../lib/characterStorage";
import { PvPScreenUI } from "./PvPScreenUI";

const OPPONENT_NAMES = [
  "ShadowKael", "LunaStrike", "CrystalFury", "EtherBlade",
  "NebulaWolf", "StarBane", "VoidWalker", "AetherKnight",
];

const OPPONENT_CLASSES = [
  "alchimiste", "luminaire", "pyromancien", "cryomancien",
  "gardien", "bastion", "berserker", "eclaireur", "archer", "invocateur",
];

export default function LocalPvPScreen() {
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

  const [leaderboard] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("aetheris-pvp-leaderboard") ?? "[]") as {
      name: string; rating: number; wins: number; classId: string;
    }[];
    if (stored.length === 0) {
      const defaults = [
        { name: characterName, rating: record.rating, wins: record.wins, classId },
        { name: "ShadowKael", rating: 1450, wins: 89, classId: "pyromancien" },
        { name: "LunaStrike", rating: 1380, wins: 72, classId: "archer" },
        { name: "CrystalFury", rating: 1320, wins: 65, classId: "gardien" },
        { name: "EtherBlade", rating: 1280, wins: 58, classId: "eclaireur" },
      ];
      localStorage.setItem("aetheris-pvp-leaderboard", JSON.stringify(defaults));
      return defaults;
    }
    return stored;
  });

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

  return (
    <PvPScreenUI
      characterName={characterName}
      classId={classId}
      rating={record.rating}
      wins={record.wins}
      losses={record.losses}
      streak={record.streak}
      mode={mode}
      onModeChange={setMode}
      searching={searching}
      error={error}
      leaderboard={leaderboard}
      onMatchmake={startMatchmaking}
      onBack={() => setScreen("world")}
    />
  );
}

export function applyLocalPvpResult(characterId: string, won: boolean) {
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
