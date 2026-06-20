import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActiveEvent = query({
  args: {},
  returns: v.union(v.any(), v.null()),
  handler: async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const events = [
      { id: "renaissance_lumina", startMonth: 3, startDay: 1, endMonth: 5, endDay: 31 },
      { id: "eclipse_aether", startMonth: 6, startDay: 1, endMonth: 8, endDay: 31 },
      { id: "invasion_ombres", startMonth: 9, startDay: 15, endMonth: 11, endDay: 15 },
      { id: "fete_cristaux", startMonth: 12, startDay: 1, endMonth: 2, endDay: 28 },
    ];

    for (const event of events) {
      const current = month * 100 + day;
      const start = event.startMonth * 100 + event.startDay;
      const end = event.endMonth * 100 + event.endDay;
      const inRange = start <= end
        ? current >= start && current <= end
        : current >= start || current <= end;
      if (inRange) return event;
    }
    return null;
  },
});

export const recordEventParticipation = mutation({
  args: {
    characterId: v.id("characters"),
    eventId: v.string(),
    action: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .collect();

    const achievementId = `event_${args.eventId}_${args.action}`;
    const already = existing.find((a) => a.achievementId === achievementId);
    if (!already) {
      await ctx.db.insert("achievements", {
        characterId: args.characterId,
        achievementId,
        unlockedAt: Date.now(),
      });
    }
    return null;
  },
});
