import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  FACTION_QUESTS,
  getQuestById,
  getWeekKey,
  type FactionQuestType,
} from "./factionContent";

export { getWeekKey };

export async function ensureFactionQuests(
  ctx: MutationCtx,
  characterId: Id<"characters">
) {
  const weekKey = getWeekKey();
  const existing = await ctx.db
    .query("factionQuestProgress")
    .withIndex("by_character_and_week", (q) =>
      q.eq("characterId", characterId).eq("weekKey", weekKey)
    )
    .collect();

  if (existing.length >= FACTION_QUESTS.length) return;

  const existingIds = new Set(existing.map((e) => e.questId));
  const now = Date.now();

  for (const template of FACTION_QUESTS) {
    if (existingIds.has(template.id)) continue;
    await ctx.db.insert("factionQuestProgress", {
      characterId,
      weekKey,
      questId: template.id,
      factionId: template.factionId,
      progress: 0,
      completed: false,
      claimed: false,
      updatedAt: now,
    });
  }
}

export async function recordFactionQuestProgress(
  ctx: MutationCtx,
  characterId: Id<"characters">,
  event: {
    type: FactionQuestType;
    zoneId?: string;
  }
) {
  await ensureFactionQuests(ctx, characterId);
  const weekKey = getWeekKey();

  const quests = await ctx.db
    .query("factionQuestProgress")
    .withIndex("by_character_and_week", (q) =>
      q.eq("characterId", characterId).eq("weekKey", weekKey)
    )
    .collect();

  for (const quest of quests) {
    if (quest.completed) continue;
    const template = getQuestById(quest.questId);
    if (!template || template.type !== event.type) continue;

    if (template.type === "zone_kills") {
      if (!event.zoneId || !template.zoneIds?.includes(event.zoneId)) continue;
    }

    const newProgress = quest.progress + 1;
    const completed = newProgress >= template.target;
    await ctx.db.patch("factionQuestProgress", quest._id, {
      progress: newProgress,
      completed,
      updatedAt: Date.now(),
    });
  }
}
