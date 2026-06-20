import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { loadCharacter } from "../lib/characterStorage";
import { cacheCloudCombat, buildCloudCombatLocalId } from "../lib/cloudCombat";
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
  const [claimMessage, setClaimMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const matchStarted = useRef(false);

  const char = loadCharacter(characterId);
  const cloudChar = useQuery(api.characters.getCharacter, { characterId });
  const leaderboard = useQuery(api.pvp.getLeaderboard, { limit: 10 });
  const activeSeason = useQuery(api.seasons.getActiveSeason, {});
  const seasonLeaderboard = useQuery(
    api.seasons.getSeasonLeaderboard,
    activeSeason ? { seasonId: activeSeason._id, limit: 10 } : "skip"
  );
  const mySeasonRating = useQuery(
    api.seasons.getMySeasonRating,
    activeSeason ? { seasonId: activeSeason._id, characterId } : "skip"
  );
  const pendingRewards = useQuery(api.cosmetics.getPendingSeasonRewards, { characterId });
  const myCosmetics = useQuery(api.cosmetics.getMyCosmetics, { characterId });
  const pendingMatch = useQuery(api.pvp.getPendingMatch, { characterId });
  const joinQueue = useMutation(api.pvp.joinQueue);
  const leaveQueue = useMutation(api.pvp.leaveQueue);
  const startPvpCombat = useMutation(api.combat.startPvpCombat);
  const initSeason = useMutation(api.seasons.initSeason);
  const claimReward = useMutation(api.cosmetics.claimSeasonReward);
  const equipCosmetic = useMutation(api.cosmetics.equipCosmetic);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (activeSeason === null) {
      void initSeason({});
    }
  }, [activeSeason, initSeason]);

  const rating = cloudChar?.pvpRating ?? char?.pvpRating ?? 1000;
  const wins = cloudChar?.pvpWins ?? char?.pvpWins ?? 0;
  const losses = cloudChar?.pvpLosses ?? char?.pvpLosses ?? 0;

  useEffect(() => {
    if (!pendingMatch || !searching || matchStarted.current) return;

    const isTeamA = pendingMatch.teamA.some(
      (p: { characterId: string }) => p.characterId === characterId
    );
    const opponents = isTeamA ? pendingMatch.teamB : pendingMatch.teamA;
    const opponent = opponents[0];
    if (!opponent) return;

    matchStarted.current = true;

    void (async () => {
      try {
        const convexCombatId = await startPvpCombat({
          matchId: pendingMatch._id as Id<"pvpMatches">,
          characterId,
          opponentCharacterId: opponent.characterId as Id<"characters">,
        });

        const localId = buildCloudCombatLocalId("pvp");
        cacheCloudCombat(localId, convexCombatId, {
          type: "pvp",
          zoneId: "arene_pvp",
          characterId,
          convexMatchId: pendingMatch._id,
          isTeamA,
          pvpOpponent: {
            name: opponent.name,
            classId: opponent.classId,
            level: char?.level ?? 10,
            characterId: opponent.characterId,
          },
        });

        setPvpMode(pendingMatch.mode, { matchId: pendingMatch._id });
        setSearching(false);
        setCombat(localId, { convexCombatId });
      } catch (e) {
        matchStarted.current = false;
        setError(e instanceof Error ? e.message : "Erreur combat PvP");
        setSearching(false);
      }
    })();
  }, [pendingMatch, searching, characterId, char?.level, setCombat, setPvpMode, startPvpCombat]);

  const startMatchmaking = async () => {
    if ((char?.level ?? 1) < 10) {
      setError("Niveau 10 requis pour l'arène PvP");
      return;
    }
    setError("");
    setSearching(true);
    matchStarted.current = false;

    try {
      await joinQueue({
        characterId,
        characterName,
        classId,
        level: char?.level ?? 1,
        rating,
        mode,
      });
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
      season={activeSeason ? {
        name: activeSeason.name,
        seasonNumber: activeSeason.seasonNumber,
        endsAt: activeSeason.endsAt,
        daysLeft: activeSeason.daysLeft,
      } : null}
      seasonLeaderboard={(seasonLeaderboard ?? []).map((e) => ({
        name: e.characterName,
        rating: e.rating,
        wins: e.wins,
        classId: e.classId,
      }))}
      seasonRating={mySeasonRating ?? null}
      pendingRewards={pendingRewards ?? []}
      cosmetics={myCosmetics ?? null}
      claimMessage={claimMessage}
      now={now}
      onClaimReward={(claimId) => {
        void (async () => {
          try {
            const result = await claimReward({
              characterId,
              claimId: claimId as Id<"seasonRewardClaims">,
            });
            setClaimMessage(
              `+${result.eclats} éclats${result.cosmeticIds.length ? ` + ${result.cosmeticIds.length} cosmétique(s)` : ""} !`
            );
          } catch (e) {
            setClaimMessage(e instanceof Error ? e.message : "Erreur");
          }
        })();
      }}
      onEquipCosmetic={(cosmeticId, slot) => {
        void equipCosmetic({ characterId, cosmeticId, slot });
      }}
      onMatchmake={() => void startMatchmaking()}
      onBack={() => {
        void leaveQueue({ characterId });
        setScreen("world");
      }}
    />
  );
}
