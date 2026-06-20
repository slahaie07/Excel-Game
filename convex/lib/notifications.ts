import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function sendNotification(
  ctx: MutationCtx,
  args: {
    characterId: Id<"characters">;
    type: string;
    title: string;
    body: string;
    screen?: string;
  }
) {
  await ctx.db.insert("notifications", {
    characterId: args.characterId,
    type: args.type,
    title: args.title,
    body: args.body,
    read: false,
    screen: args.screen,
    createdAt: Date.now(),
  });
}
