import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useGameStore } from "../stores/gameStore";
import {
  loadCharacter,
  loadPvpRecord,
  savePvpRecord,
} from "../lib/characterStorage";
import { isConvexEnabled } from "../lib/convexUtils";
import {
  buildLiveCombatLocalId,
  buildLiveQueuePayload,
  cacheLiveCombat,
  getOrCreatePlayerKey,
} from "../lib/pvpRealtime";
import { PvPScreenUI } from "./PvPScreenUI";

const OPPONENT_NAMES = [
  "ShadowKael", "LunaStrike", "CrystalFury", "EtherBlade",
  "NebulaWolf", "StarBane", "VoidWalker", "AetherKnight",
];

const OPPONENT_CLASSES = ["pyromancien", "gardien", "eclaireur", "archer", "berserker", "alchimiste"];

export default function LocalPvPScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setPvpMode = useGameStore((s) => s.setPvpMode);
  const pvpArenaMode = useGameStore((s) => s.pvpArenaMode);
  const setPvpArenaMode = useGameStore((s) => s.setPvpArenaMode);
  const startLivePvpCombat = useGameStore((s) => s.startLivePvpCombat);
  const setLiveMatch = useGameStore((s) => s.setLiveMatch);

  const [mode, setMode] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const matchStarted = useRef(false);
  const playerKey = getOrCreatePlayerKey(characterId);

  const char = loadCharacter(characterId);
  const record = loadPvpRecord(characterId);
  const convexOn = isConvexEnabled();

  const liveQueueStatus = useQuery(
    api.pvpLive.getLiveQueueStatus,
    convexOn && searching && pvpArenaMode === "live"
      ? { playerKey }
      : "skip"
  );
  const pendingLiveMatch = useQuery(
    api.pvpLive.getActiveLiveMatch,
    convexOn && searching && pvpArenaMode === "live"
      ? { playerKey }
      : "skip"
  );

  const joinLiveQueue = useMutation(api.pvpLive.joinLiveQueue);
  const leaveLiveQueue = useMutation(api.pvpLive.leaveLiveQueue);

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

  useEffect(() => {
    if (!pendingLiveMatch || matchStarted.current || pvpArenaMode !== "live") return;
    matchStarted.current = true;

    const opponentName =
      pendingLiveMatch.playerAKey === playerKey
        ? pendingLiveMatch.playerBName
        : pendingLiveMatch.playerAName;
    const opponentClassId =
      pendingLiveMatch.playerAKey === playerKey
        ? pendingLiveMatch.playerBClassId
        : pendingLiveMatch.playerAClassId;

    const localId = buildLiveCombatLocalId();
    cacheLiveCombat(
      localId,
      pendingLiveMatch._id,
      playerKey,
      { name: opponentName, classId: opponentClassId }
    );

    setLiveMatch(pendingLiveMatch._id, playerKey);
    startLivePvpCombat(pendingLiveMatch._id, playerKey, localId);
    setSearching(false);
  }, [pendingLiveMatch, pvpArenaMode, playerKey, setLiveMatch, startLivePvpCombat]);

  useEffect(() => {
    if (
      liveQueueStatus?.status === "matched" &&
      liveQueueStatus.matchId &&
      !matchStarted.current
    ) {
      // getActiveLiveMatch effect will pick this up
    }
  }, [liveQueueStatus]);

  useEffect(() => {
    return () => {
      if (searching && pvpArenaMode === "live" && convexOn) {
        void leaveLiveQueue({ playerKey });
      }
    };
  }, [searching, pvpArenaMode, convexOn, playerKey, leaveLiveQueue]);

  const startBotMatchmaking = () => {
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
      setCombat(combatId, { combatSource: "pvp" });
    }, 1500 + Math.random() * 2000);
  };

  const startLiveMatchmaking = async () => {
    if ((char?.level ?? 1) < 10) {
      setError("Niveau 10 requis pour l'arène PvP");
      return;
    }
    if (!convexOn) {
      setError("Connexion Convex requise pour les duels joueurs");
      return;
    }
    setError("");
    setSearching(true);
    matchStarted.current = false;

    try {
      const payload = buildLiveQueuePayload(characterId, characterName, classId);
      const matchId = await joinLiveQueue(payload);
      if (matchId) {
        setLiveMatch(matchId, playerKey);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur matchmaking");
      setSearching(false);
    }
  };

  const startMatchmaking = () => {
    if (pvpArenaMode === "live") {
      void startLiveMatchmaking();
    } else {
      startBotMatchmaking();
    }
  };

  const handleBack = () => {
    if (searching && pvpArenaMode === "live" && convexOn) {
      void leaveLiveQueue({ playerKey });
    }
    setSearching(false);
    setScreen("world");
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
      arenaMode={pvpArenaMode}
      onArenaModeChange={(m) => {
        setPvpArenaMode(m);
        setSearching(false);
        matchStarted.current = false;
      }}
      liveQueueStatus={liveQueueStatus ?? null}
      liveConvexEnabled={convexOn}
      searching={searching}
      error={error}
      leaderboard={leaderboard}
      onMatchmake={startMatchmaking}
      onBack={handleBack}
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
