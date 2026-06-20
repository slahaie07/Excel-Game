import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { CLASSES } from "../game/data";

export default function CloudFriends() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);
  const setTradePartner = useGameStore((s) => s.setTradePartner);
  const setViewingGuildHall = useGameStore((s) => s.setViewingGuildHall);
  const [searchName, setSearchName] = useState("");
  const [error, setError] = useState("");
  const [mentorMsg, setMentorMsg] = useState("");

  const friends = useQuery(api.friends.listFriends, { characterId: characterId as Id<"characters"> });
  const myMentorship = useQuery(api.mentorship.getMyMentorship, { characterId: characterId as Id<"characters"> });
  const cloudChar = useQuery(api.characters.getCharacter, { characterId: characterId as Id<"characters"> });
  const searchResult = useQuery(
    api.friends.searchCharacterByName,
    searchName.length >= 2 ? { name: searchName } : "skip"
  );
  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriend = useMutation(api.friends.acceptFriend);
  const requestMentorship = useMutation(api.mentorship.requestMentorship);
  const acceptMentorship = useMutation(api.mentorship.acceptMentorship);
  const declineMentorship = useMutation(api.mentorship.declineMentorship);

  const myLevel = cloudChar?.level ?? 1;
  const canBeMentee = myLevel <= 25;
  const canBeMentor = myLevel >= 30;

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Amis ☁️</h1>
      </div>

      {myMentorship && (
        <div className="mx-4 mt-3 card border-purple-500/30 bg-purple-950/15">
          <p className="text-purple-300 text-xs font-bold uppercase">Mentorat</p>
          <p className="text-white text-sm">
            {myMentorship.role === "mentee" ? "Mentor" : "Apprenti"} : {myMentorship.partnerName} (niv. {myMentorship.partnerLevel})
          </p>
          {myMentorship.status === "active" && (
            <p className="text-aether-400 text-xs">
              {myMentorship.menteeProgress} progrès • {myMentorship.mentorPoints} pts mentor
            </p>
          )}
          {myMentorship.role === "mentor" && myMentorship.status === "pending" && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  void acceptMentorship({
                    mentorshipId: myMentorship.mentorshipId,
                    mentorId: characterId as Id<"characters">,
                  }).then(() => setMentorMsg("Mentorat accepté !"))
                    .catch((e) => setMentorMsg(e instanceof Error ? e.message : "Erreur"));
                }}
                className="btn-primary text-xs py-1 px-2"
              >
                Accepter
              </button>
              <button
                onClick={() => {
                  void declineMentorship({
                    mentorshipId: myMentorship.mentorshipId,
                    mentorId: characterId as Id<"characters">,
                  }).then(() => setMentorMsg("Demande refusée"))
                    .catch((e) => setMentorMsg(e instanceof Error ? e.message : "Erreur"));
                }}
                className="btn-secondary text-xs py-1 px-2"
              >
                Refuser
              </button>
            </div>
          )}
        </div>
      )}
      {mentorMsg && <p className="text-green-400 text-xs px-4 mt-1">{mentorMsg}</p>}

      <div className="p-4 border-b border-aether-700/40 flex gap-2">
        <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Nom exact" className="flex-1 bg-aether-900 border border-aether-700 rounded-xl px-3 py-2 text-sm text-white" />
        <button
          onClick={async () => {
            if (!searchResult) { setError("Introuvable"); return; }
            try {
              await sendRequest({ characterId: characterId as Id<"characters">, friendId: searchResult._id });
              setError("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erreur");
            }
          }}
          className="btn-secondary text-sm px-4"
        >
          Ajouter
        </button>
      </div>
      {error && <p className="text-red-400 text-xs px-4">{error}</p>}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(friends ?? []).map((f) => {
          const cls = CLASSES.find((c) => c.id === f.classId);
          const showMentorBtn = f.status === "accepted" && !f.isIncoming && canBeMentee && f.level >= 30 && !myMentorship;
          const showMenteeBtn = f.status === "accepted" && !f.isIncoming && canBeMentor && f.level <= 25 && !myMentorship;
          return (
            <div key={f.friendId} className="card flex items-center gap-3">
              <span className="text-2xl">{cls?.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{f.name}</p>
                <p className="text-aether-500 text-xs">Niv. {f.level}</p>
              </div>
              {f.status === "accepted" && !f.isIncoming && (
                <>
                  {showMentorBtn && (
                    <button
                      onClick={() => {
                        void requestMentorship({
                          menteeId: characterId as Id<"characters">,
                          mentorId: f.friendId,
                        }).then(() => setMentorMsg(`Demande envoyée à ${f.name}`))
                          .catch((e) => setMentorMsg(e instanceof Error ? e.message : "Erreur"));
                      }}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      🎓 Mentor
                    </button>
                  )}
                  {showMenteeBtn && (
                    <button
                      onClick={() => {
                        void requestMentorship({
                          menteeId: f.friendId,
                          mentorId: characterId as Id<"characters">,
                        }).then(() => setMentorMsg(`Demande envoyée à ${f.name}`))
                          .catch((e) => setMentorMsg(e instanceof Error ? e.message : "Erreur"));
                      }}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      🎓 Guider
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setTradePartner(f.friendId);
                      setScreen("trade");
                    }}
                    className="btn-secondary text-xs py-1 px-2"
                  >
                    Échanger
                  </button>
                  {f.guildId && (
                    <button
                      onClick={() => {
                        setViewingGuildHall(f.guildId);
                        setScreen("guild-hall");
                      }}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      🏰 Hall{f.guildTag ? ` [${f.guildTag}]` : ""}
                    </button>
                  )}
                </>
              )}
              {f.isIncoming && f.status === "pending" && (
                <button
                  onClick={() => void acceptFriend({ characterId: characterId as Id<"characters">, friendId: f.friendId })}
                  className="btn-primary text-xs py-1 px-2"
                >
                  Accepter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
