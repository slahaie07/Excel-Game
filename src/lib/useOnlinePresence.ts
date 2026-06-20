import { useEffect } from "react";
import { useGameStore } from "../stores/gameStore";

/**
 * Hook pour synchroniser la présence joueur avec Convex quand en ligne.
 * Fallback silencieux en mode hors-ligne.
 */
export function useOnlinePresence() {
  const characterId = useGameStore((s) => s.characterId);
  const characterName = useGameStore((s) => s.characterName);
  const classId = useGameStore((s) => s.classId);
  const zoneId = useGameStore((s) => s.zoneId);
  const isOnline = useGameStore((s) => s.isOnline);

  useEffect(() => {
    if (!isOnline || !characterId || !characterName || !classId) return;

    const interval = setInterval(() => {
      // Convex heartbeat sera appelé quand VITE_CONVEX_URL est configuré
      // et le client Convex est connecté via useMutation(api.presence.heartbeat)
      const key = `aetheris-presence-${zoneId}`;
      const players = JSON.parse(localStorage.getItem(key) ?? "[]") as {
        name: string; classId: string; level: number; lastSeen: number;
      }[];
      const char = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
      const entry = {
        name: characterName,
        classId,
        level: char.level ?? 1,
        lastSeen: Date.now(),
      };
      const filtered = players.filter((p) => p.name !== characterName && Date.now() - p.lastSeen < 300000);
      localStorage.setItem(key, JSON.stringify([...filtered, entry]));
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, characterId, characterName, classId, zoneId]);
}

export function getOnlinePlayersInZone(zoneId: string): { name: string; classId: string; level: number }[] {
  const key = `aetheris-presence-${zoneId}`;
  const players = JSON.parse(localStorage.getItem(key) ?? "[]") as {
    name: string; classId: string; level: number; lastSeen: number;
  }[];
  return players
    .filter((p) => Date.now() - p.lastSeen < 300000)
    .map(({ name, classId, level }) => ({ name, classId, level }));
}
