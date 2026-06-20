import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { formatCountdown } from "../lib/formatTime";

const CONTRIBUTE_AMOUNTS = {
  boss_rush: 250,
  kill_race: 1,
  harvest: 50,
};

export default function CloudLiveEventsScreen() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const characterName = useGameStore((s) => s.characterName)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const [now, setNow] = useState(Date.now());
  const [msg, setMsg] = useState("");

  const liveEvents = useQuery(api.liveEvents.getActiveLiveEvents, {});
  const initLive = useMutation(api.liveEvents.initLiveEvent);
  const contribute = useMutation(api.liveEvents.contributeToLiveEvent);
  const claimReward = useMutation(api.liveEvents.claimLiveEventReward);

  const event = liveEvents?.[0];

  const myContrib = useQuery(
    api.liveEvents.getMyLiveEventContribution,
    event ? { liveEventId: event._id, characterId } : "skip"
  );
  const leaderboard = useQuery(
    api.liveEvents.getLiveEventLeaderboard,
    event ? { liveEventId: event._id, limit: 10 } : "skip"
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (liveEvents !== undefined && liveEvents.length === 0) {
      void initLive({});
    }
  }, [liveEvents, initLive]);

  const handleContribute = async () => {
    if (!event) return;
    const amount = CONTRIBUTE_AMOUNTS[event.type];
    try {
      const result = await contribute({
        liveEventId: event._id,
        characterId,
        characterName,
        amount,
      });
      setMsg(`+${amount} contribution ! Global: ${result.globalProgress}/${event.globalTarget}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleClaim = async () => {
    if (!event) return;
    try {
      const result = await claimReward({ liveEventId: event._id, characterId });
      setMsg(`Récompense : +${result.eclats} ✦, +${result.xp} XP`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (liveEvents === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-aether-950 text-aether-400">
        Chargement des événements live...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col bg-aether-950">
        <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
          <button onClick={() => setScreen("events")} className="text-aether-400 text-xl">←</button>
          <h1 className="font-display text-xl font-bold">🌐 Live cross-serveur</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center text-aether-400">
          Aucun événement live actif. Revenez bientôt !
        </div>
      </div>
    );
  }

  const canClaim =
    myContrib &&
    myContrib.contribution > 0 &&
    !myContrib.rewardClaimed &&
    (event.progressPercent >= 100 || now >= event.endsAt);

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("events")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">🌐 Live cross-serveur</h1>
        <span className="ml-auto text-green-400/70 text-xs">☁️ Global</span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="card border-purple-500/40 bg-purple-950/20">
          <p className="text-purple-300 text-xs font-bold uppercase">Événement live</p>
          <h2 className="font-display text-lg font-bold text-white">{event.name}</h2>
          <p className="text-aether-400 text-sm mt-1">{event.description}</p>
          <p className="text-orange-400 text-xs mt-2">⏱ {formatCountdown(event.endsAt, now)}</p>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-aether-400 mb-1">
              <span>Progression globale</span>
              <span>{event.globalProgress.toLocaleString()} / {event.globalTarget.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-aether-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-crystal-gold transition-all"
                style={{ width: `${event.progressPercent}%` }}
              />
            </div>
          </div>

          {myContrib && (
            <p className="text-aether-300 text-xs mt-2">
              Votre contribution : {myContrib.contribution.toLocaleString()} • Rang #{myContrib.rank}
            </p>
          )}

          <p className="text-crystal-gold text-xs mt-2">
            Récompense : ✦ {event.rewardEclats} • {event.rewardXp} XP
          </p>
        </div>

        {msg && <p className="text-aether-300 text-sm text-center">{msg}</p>}

        <button onClick={() => void handleContribute()} className="btn-primary w-full">
          Contribuer ({event.type === "kill_race" ? "+1 élimination" : `+${CONTRIBUTE_AMOUNTS[event.type]}`})
        </button>

        {canClaim && (
          <button onClick={() => void handleClaim()} className="btn-secondary w-full border-crystal-gold/50 text-crystal-gold">
            Réclamer la récompense
          </button>
        )}

        <div>
          <h3 className="text-aether-400 text-sm mb-2">Classement contributeurs</h3>
          {(leaderboard ?? []).length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">Soyez le premier à contribuer !</p>
          ) : (
            (leaderboard ?? []).map((entry, i) => (
              <div key={i} className="card mb-1 flex items-center gap-3 py-2">
                <span className="text-aether-500 w-6 font-bold">#{i + 1}</span>
                <p className="text-white text-sm flex-1">{entry.characterName}</p>
                <span className="text-purple-300 text-sm">{entry.contribution.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
