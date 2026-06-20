import { useGameStore } from "../stores/gameStore";
import { DailyRewardsUI } from "./DailyRewardsUI";

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem("aetheris-daily-local") ?? "{}") as {
      streak?: number; lastClaim?: number;
    };
  } catch {
    return {};
  }
}

export default function LocalDailyRewards() {
  const characterId = useGameStore((s) => s.characterId)!;
  const data = loadLocal();
  const today = new Date().toDateString();
  const last = data.lastClaim ? new Date(data.lastClaim).toDateString() : "";
  const claimedToday = last === today;
  const streak = data.streak ?? 0;
  const reward = 50 + (claimedToday ? streak : streak + 1) * 10;

  return (
    <DailyRewardsUI
      canClaim={!claimedToday}
      streak={streak}
      reward={reward}
      onClaim={async () => {
        const charKey = `aetheris-char-${characterId}`;
        const char = JSON.parse(localStorage.getItem(charKey) ?? "{}");
        char.eclats = (char.eclats ?? 0) + reward;
        localStorage.setItem(charKey, JSON.stringify(char));
        localStorage.setItem("aetheris-daily-local", JSON.stringify({
          streak: streak + 1,
          lastClaim: Date.now(),
        }));
        alert(`+${reward} ✦ • Série ${streak + 1}j`);
      }}
    />
  );
}
