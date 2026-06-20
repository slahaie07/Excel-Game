import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { loadCharacter } from "../lib/characterStorage";
import { PvPScreenUI } from "./PvPScreenUI";

export default function CloudPvPScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const classId = useGameStore((s) => s.classId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setCombat = useGameStore((s) => s.setCombat);
  const setPvpMode = useGameStore((s) => s.setPvpMode);

  const [mode, setMode] = useState<"1v1" | "2v2" | "3v3">("1v1");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const char = loadCharacter(characterId);
  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const leaderboard = useQuery(api.pvp.getLeaderboard, { limit: 10 });
  const pendingMatch = useQuery(api.pvp.getPendingMatch, { characterId });
  const joinQueue = useMutation(api.pvp.joinQueue);
  const leaveQueue = useMutation(api.pvp.leaveQueue);

  const rating = cloudChar?.pvpRating ?? char?.pvpRating ?? 1000;
  const wins = cloudChar?.pvpWins ?? char?.pvpWins ?? 0;
  const losses = cloudChar?.pvpLosses ?? char?.pvpLosses ?? 0;

  useEffect(() => {
    if (!pendingMatch || !searching) return;

    const isTeamA = pendingMatch.teamA.some(
      (p: { characterId: string }) => p.characterId === characterId
    );
    const opponents = isTeamA ? pendingMatch.teamB : pendingMatch.teamA;
    const opponent = opponents[0];
    if (!opponent) return;

    const combatId = `pvp_${Date.now()}`;
    localStorage.setItem(`aetheris-combat-${combatId}`, JSON.stringify({
      type: "pvp",
      mode: pendingMatch.mode,
      monsterIds: [],
      pvpOpponent: {
        name: opponent.name,
        classId: opponent.classId,
        level: char?.level ?? 10,
        characterId: opponent.characterId,
      },
      zoneId: "arene_pvp",
      characterId,
      convexMatchId: pendingMatch._id,
      isTeamA,
    }));

    setPvpMode(pendingMatch.mode, { matchId: pendingMatch._id });
    setSearching(false);
    setCombat(combatId, {});
  }, [pendingMatch, searching, characterId, char?.level, setCombat, setPvpMode]);

  const startMatchmaking = async () => {
    if ((char?.level ?? 1) < 10) {
      setError("Niveau 10 requis pour l'arène PvP");
      return;
    }
    setError("");
    setSearching(true);

    try {
      const matchId = await joinQueue({
        characterId,
        characterName,
        classId,
        level: char?.level ?? 1,
        rating,
        mode,
      });

      if (matchId) {
        // Match found immediately — useQuery will pick it up
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur matchmaking");
      setSearching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searching) void leaveQueue({ characterId });
    };
  }, [searching, characterId, leaveQueue]);

  return (
    <PvPScreenUI
      characterName={characterName}
      classId={classId}
      rating={rating}
      wins={wins}
      losses={losses}
      streak={0}
      mode={mode}
      onModeChange={setMode}
      searching={searching}
      error={error}
      loading={cloudChar === undefined}
      leaderboard={(leaderboard ?? []).map((e) => ({
        name: e.name,
        rating: e.pvpRating,
        wins: e.pvpWins,
        classId: e.classId,
      }))}
      onMatchmake={() => void startMatchmaking()}
      onBack={() => {
        void leaveQueue({ characterId });
        setScreen("world");
      }}
    />
  );
}
