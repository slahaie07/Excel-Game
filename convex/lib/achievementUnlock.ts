import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; icon: string }> = {
  first_victory: { name: "Première Victoire", description: "Gagner un combat", icon: "⚔️" },
  level_10: { name: "Éveilleur Confirmé", description: "Atteindre le niveau 10", icon: "⭐" },
  level_30: { name: "Maître Cristallin", description: "Atteindre le niveau 30", icon: "💎" },
  level_50: { name: "Légende d'Aether", description: "Atteindre le niveau 50", icon: "🌟" },
  dungeon_clear: { name: "Explorateur", description: "Terminer un donjon", icon: "🏚️" },
  pvp_win_10: { name: "Gladiateur", description: "10 victoires PvP", icon: "🏆" },
  guild_member: { name: "Fraternité", description: "Rejoindre une guilde", icon: "🏰" },
  event_participant: { name: "Fêtard", description: "Participer à un événement", icon: "🎉" },
  pet_owner: { name: "Dresseur", description: "Obtenir un compagnon", icon: "✨" },
  raid_clear: { name: "Conquérant", description: "Terminer un raid", icon: "🐉" },
  war_hero: { name: "Héros de Guerre", description: "Contribuer à une guerre de guilde", icon: "⚔️" },
  live_contributor: { name: "Éveilleur Global", description: "Contribuer à un événement live", icon: "🌐" },
  guild_war_victor: { name: "Victorieux", description: "Gagner une guerre de guilde", icon: "🏅" },
};

export async function tryUnlockAchievement(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  achievementId: string
): Promise<boolean> {
  if (!ACHIEVEMENT_DEFS[achievementId]) return false;

  const existing = await ctx.db
    .query("achievements")
    .withIndex("by_character", (q) => q.eq("characterId", characterId))
    .collect();

  if (existing.some((a) => a.achievementId === achievementId)) return false;

  await ctx.db.insert("achievements", {
    characterId,
    achievementId,
    unlockedAt: Date.now(),
  });
  return true;
}

export async function syncCharacterAchievements(
  ctx: MutationCtx,
  characterId: Id<"characters">
): Promise<string[]> {
  const character = await ctx.db.get("characters", characterId);
  if (!character) return [];

  const unlocked: string[] = [];

  if (character.level >= 10 && (await tryUnlockAchievement(ctx, characterId, "level_10"))) {
    unlocked.push("level_10");
  }
  if (character.level >= 30 && (await tryUnlockAchievement(ctx, characterId, "level_30"))) {
    unlocked.push("level_30");
  }
  if (character.level >= 50 && (await tryUnlockAchievement(ctx, characterId, "level_50"))) {
    unlocked.push("level_50");
  }
  if (character.pvpWins >= 10 && (await tryUnlockAchievement(ctx, characterId, "pvp_win_10"))) {
    unlocked.push("pvp_win_10");
  }
  if (character.guildId && (await tryUnlockAchievement(ctx, characterId, "guild_member"))) {
    unlocked.push("guild_member");
  }
  if (character.petId && (await tryUnlockAchievement(ctx, characterId, "pet_owner"))) {
    unlocked.push("pet_owner");
  }

  return unlocked;
}
