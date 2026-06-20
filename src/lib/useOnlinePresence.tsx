import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { loadCharacter } from "./characterStorage";
import { isCloudCharacter, isConvexEnabled } from "./convexUtils";

function CloudPresenceHeartbeat() {
  const characterId = useGameStore((s) => s.characterId);
  const characterName = useGameStore((s) => s.characterName);
  const classId = useGameStore((s) => s.classId);
  const zoneId = useGameStore((s) => s.zoneId);
  const heartbeat = useMutation(api.presence.heartbeat);

  useEffect(() => {
    if (!characterId || !characterName || !classId || !isCloudCharacter(characterId)) return;
    const char = loadCharacter(characterId);
    const send = () => {
      void heartbeat({
        characterId: characterId as Id<"characters">,
        characterName,
        classId,
        level: char?.level ?? 1,
        zoneId,
      });
    };
    send();
    const interval = setInterval(send, 30000);
    return () => clearInterval(interval);
  }, [characterId, characterName, classId, zoneId, heartbeat]);

  return null;
}

export function OnlinePresenceSync() {
  if (!isConvexEnabled()) return null;
  return <CloudPresenceHeartbeat />;
}

/** Sync cloud player list into parent state */
export function CloudZonePlayers({
  zoneId,
  excludeName,
  onPlayers,
}: {
  zoneId: string;
  excludeName: string;
  onPlayers: (players: { name: string; classId: string; level: number; equippedTitleId: string | null }[]) => void;
}) {
  const players = useQuery(api.presence.getPlayersInZone, { zoneId });
  useEffect(() => {
    onPlayers((players ?? []).filter((p) => p.characterName !== excludeName).map((p) => ({
      name: p.characterName,
      classId: p.classId,
      level: p.level,
      equippedTitleId: p.equippedTitleId ?? null,
    })));
  }, [players, excludeName, onPlayers]);
  return null;
}

export function useOnlinePresence() {
  const characterId = useGameStore((s) => s.characterId);
  const characterName = useGameStore((s) => s.characterName);
  const classId = useGameStore((s) => s.classId);
  const zoneId = useGameStore((s) => s.zoneId);
  const isOnline = useGameStore((s) => s.isOnline);

  useEffect(() => {
    if (isConvexEnabled() && isCloudCharacter(characterId)) return;
    if (!isOnline || !characterId || !characterName || !classId) return;

    const interval = setInterval(() => {
      const key = `aetheris-presence-${zoneId}`;
      const stored = JSON.parse(localStorage.getItem(key) ?? "[]") as {
        name: string; classId: string; level: number; lastSeen: number; equippedTitleId?: string | null;
      }[];
      const char = loadCharacter(characterId);
      const cosmetics = char ? JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}").cosmetics : null;
      const entry = {
        name: characterName,
        classId,
        level: char?.level ?? 1,
        lastSeen: Date.now(),
        equippedTitleId: cosmetics?.equippedTitle ?? null,
      };
      const filtered = stored.filter((p) => p.name !== characterName && Date.now() - p.lastSeen < 300000);
      localStorage.setItem(key, JSON.stringify([...filtered, entry]));
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, characterId, characterName, classId, zoneId]);
}

export function getOnlinePlayersInZone(zoneId: string) {
  const key = `aetheris-presence-${zoneId}`;
  const players = JSON.parse(localStorage.getItem(key) ?? "[]") as {
    name: string; classId: string; level: number; lastSeen: number; equippedTitleId?: string | null;
  }[];
  return players
    .filter((p) => Date.now() - p.lastSeen < 300000)
    .map(({ name, classId, level, equippedTitleId }) => ({ name, classId, level, equippedTitleId: equippedTitleId ?? null }));
}
