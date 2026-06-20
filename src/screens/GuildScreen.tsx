import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { isCloudCharacter } from "../lib/convexUtils";
import { GuildScreenUI } from "./GuildScreenUI";

function CloudGuild() {
  const characterId = useGameStore((s) => s.characterId)!;
  const characterName = useGameStore((s) => s.characterName)!;
  const setGuildId = useGameStore((s) => s.setGuildId);
  const cloudGuilds = useQuery(api.social.listGuilds, {});
  const createGuildMutation = useMutation(api.social.createGuild);
  const joinGuildMutation = useMutation(api.social.joinGuild);
  const [error, setError] = useState("");

  const guilds = (cloudGuilds ?? []).map((g) => ({
    id: g._id as string,
    name: g.name,
    tag: g.tag,
    level: g.level,
    members: g.memberCount,
    emblem: g.emblem,
  }));

  return (
    <GuildScreenUI
      guilds={guilds}
      loading={cloudGuilds === undefined}
      cloud
      error={error}
      onCreate={async (name, tag) => {
        const guildId = await createGuildMutation({
          name,
          tag,
          description: `Guilde fondée par ${characterName}`,
          leaderId: characterId as Id<"characters">,
          emblem: "🏰",
        });
        setGuildId(guildId);
      }}
      onJoin={async (guildId) => {
        await joinGuildMutation({
          guildId: guildId as Id<"guilds">,
          characterId: characterId as Id<"characters">,
        });
        setGuildId(guildId);
      }}
      onError={setError}
    />
  );
}

function LocalGuild() {
  const characterId = useGameStore((s) => s.characterId)!;
  const [guilds, setGuilds] = useState(() =>
    JSON.parse(localStorage.getItem("aetheris-guilds") ?? "[]") as {
      id: string; name: string; tag: string; level: number; members: number; emblem: string;
    }[]
  );

  return (
    <GuildScreenUI
      guilds={guilds}
      onCreate={async (name, tag) => {
        const newGuild = { id: `guild_${Date.now()}`, name, tag, level: 1, members: 1, emblem: "🏰" };
        const updated = [...guilds, newGuild];
        setGuilds(updated);
        localStorage.setItem("aetheris-guilds", JSON.stringify(updated));
        const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
        charData.guildId = newGuild.id;
        localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
      }}
      onJoin={async (guildId) => {
        const updated = guilds.map((g) => g.id === guildId ? { ...g, members: g.members + 1 } : g);
        setGuilds(updated);
        localStorage.setItem("aetheris-guilds", JSON.stringify(updated));
        const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
        charData.guildId = guildId;
        localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
      }}
    />
  );
}

export default function GuildScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  return isCloudCharacter(characterId) ? <CloudGuild /> : <LocalGuild />;
}
