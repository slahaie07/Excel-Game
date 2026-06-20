import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export type HallOfFameCategory =
  | "pvp_legend"
  | "season_champion"
  | "tournament_champion"
  | "raid_hero"
  | "live_legend"
  | "guild_war_champion";

export async function addHallOfFameEntry(
  ctx: MutationCtx,
  args: {
    category: HallOfFameCategory;
    displayName: string;
    subtitle: string;
    value: number;
    icon: string;
    periodLabel: string;
    characterId?: Id<"characters">;
    guildId?: Id<"guilds">;
  }
) {
  await ctx.db.insert("hallOfFameEntries", {
    category: args.category,
    characterId: args.characterId,
    guildId: args.guildId,
    displayName: args.displayName,
    subtitle: args.subtitle,
    value: args.value,
    icon: args.icon,
    achievedAt: Date.now(),
    periodLabel: args.periodLabel,
  });
}
