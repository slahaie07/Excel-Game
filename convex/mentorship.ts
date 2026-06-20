import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { sendNotification } from "./lib/notifications";

const MENTOR_MIN_LEVEL = 30;
const MENTEE_MAX_LEVEL = 25;
const MAX_ACTIVE_MENTEES = 3;

async function areFriends(
  ctx: MutationCtx,
  a: Id<"characters">,
  b: Id<"characters">
): Promise<boolean> {
  const outgoing = await ctx.db
    .query("friends")
    .withIndex("by_character", (q) => q.eq("characterId", a))
    .collect();
  return outgoing.some((f) => f.friendId === b && f.status === "accepted");
}

export async function recordMenteePvpWin(ctx: MutationCtx, menteeId: Id<"characters">) {
  const mentorship = await ctx.db
    .query("mentorships")
    .withIndex("by_mentee", (q) => q.eq("menteeId", menteeId))
    .collect();

  const active = mentorship.find((m) => m.status === "active");
  if (!active) return;

  await ctx.db.patch("mentorships", active._id, {
    mentorPoints: active.mentorPoints + 10,
    menteeProgress: active.menteeProgress + 1,
    updatedAt: Date.now(),
  });
}

export async function recordMenteePveWin(ctx: MutationCtx, menteeId: Id<"characters">) {
  const mentorship = await ctx.db
    .query("mentorships")
    .withIndex("by_mentee", (q) => q.eq("menteeId", menteeId))
    .collect();

  const active = mentorship.find((m) => m.status === "active");
  if (!active) return;

  await ctx.db.patch("mentorships", active._id, {
    mentorPoints: active.mentorPoints + 5,
    menteeProgress: active.menteeProgress + 1,
    updatedAt: Date.now(),
  });
}

export const requestMentorship = mutation({
  args: {
    menteeId: v.id("characters"),
    mentorId: v.id("characters"),
  },
  returns: v.id("mentorships"),
  handler: async (ctx, args) => {
    if (args.menteeId === args.mentorId) throw new Error("Mentorat invalide");

    const mentee = await ctx.db.get("characters", args.menteeId);
    const mentor = await ctx.db.get("characters", args.mentorId);
    if (!mentee || !mentor) throw new Error("Personnage introuvable");
    if (mentee.level > MENTEE_MAX_LEVEL) throw new Error(`Niveau max apprenti : ${MENTEE_MAX_LEVEL}`);
    if (mentor.level < MENTOR_MIN_LEVEL) throw new Error(`Niveau min mentor : ${MENTOR_MIN_LEVEL}`);

    const friends = await areFriends(ctx, args.menteeId, args.mentorId);
    if (!friends) throw new Error("Vous devez être amis pour le mentorat");

    const existingMentee = await ctx.db
      .query("mentorships")
      .withIndex("by_mentee", (q) => q.eq("menteeId", args.menteeId))
      .collect();
    if (existingMentee.some((m) => m.status === "active" || m.status === "pending")) {
      throw new Error("Mentorat déjà en cours ou demandé");
    }

    const mentorActive = await ctx.db
      .query("mentorships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
    if (mentorActive.filter((m) => m.status === "active").length >= MAX_ACTIVE_MENTEES) {
      throw new Error("Ce mentor a atteint le maximum d'apprentis");
    }

    const id = await ctx.db.insert("mentorships", {
      mentorId: args.mentorId,
      menteeId: args.menteeId,
      status: "pending",
      mentorPoints: 0,
      menteeProgress: 0,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await sendNotification(ctx, {
      characterId: args.mentorId,
      type: "mentorship_request",
      title: "Demande de mentorat",
      body: `${mentee.name} souhaite devenir votre apprenti.`,
      screen: "friends",
    });

    return id;
  },
});

export const acceptMentorship = mutation({
  args: {
    mentorshipId: v.id("mentorships"),
    mentorId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get("mentorships", args.mentorshipId);
    if (!mentorship) throw new Error("Mentorat introuvable");
    if (mentorship.mentorId !== args.mentorId) throw new Error("Non autorisé");
    if (mentorship.status !== "pending") throw new Error("Demande déjà traitée");

    await ctx.db.patch("mentorships", args.mentorshipId, {
      status: "active",
      updatedAt: Date.now(),
    });

    const mentor = await ctx.db.get("characters", args.mentorId);
    await sendNotification(ctx, {
      characterId: mentorship.menteeId,
      type: "mentorship_accepted",
      title: "Mentorat accepté !",
      body: `${mentor?.name ?? "Votre mentor"} vous guide désormais.`,
      screen: "friends",
    });
    return null;
  },
});

export const declineMentorship = mutation({
  args: {
    mentorshipId: v.id("mentorships"),
    mentorId: v.id("characters"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get("mentorships", args.mentorshipId);
    if (!mentorship) throw new Error("Mentorat introuvable");
    if (mentorship.mentorId !== args.mentorId) throw new Error("Non autorisé");
    if (mentorship.status !== "pending") throw new Error("Demande déjà traitée");

    await ctx.db.delete("mentorships", args.mentorshipId);
    return null;
  },
});

export const getMyMentorship = query({
  args: { characterId: v.id("characters") },
  returns: v.union(
    v.object({
      role: v.union(v.literal("mentor"), v.literal("mentee")),
      mentorshipId: v.id("mentorships"),
      partnerId: v.id("characters"),
      partnerName: v.string(),
      partnerLevel: v.number(),
      status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
      mentorPoints: v.number(),
      menteeProgress: v.number(),
      isIncoming: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const asMentee = await ctx.db
      .query("mentorships")
      .withIndex("by_mentee", (q) => q.eq("menteeId", args.characterId))
      .collect();
    const activeMentee = asMentee.find((m) => m.status === "active" || m.status === "pending");
    if (activeMentee) {
      const mentor = await ctx.db.get("characters", activeMentee.mentorId);
      return {
        role: "mentee" as const,
        mentorshipId: activeMentee._id,
        partnerId: activeMentee.mentorId,
        partnerName: mentor?.name ?? "?",
        partnerLevel: mentor?.level ?? 0,
        status: activeMentee.status,
        mentorPoints: activeMentee.mentorPoints,
        menteeProgress: activeMentee.menteeProgress,
        isIncoming: false,
      };
    }

    const asMentor = await ctx.db
      .query("mentorships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.characterId))
      .collect();
    const pending = asMentor.find((m) => m.status === "pending");
    if (pending) {
      const mentee = await ctx.db.get("characters", pending.menteeId);
      return {
        role: "mentor" as const,
        mentorshipId: pending._id,
        partnerId: pending.menteeId,
        partnerName: mentee?.name ?? "?",
        partnerLevel: mentee?.level ?? 0,
        status: pending.status,
        mentorPoints: pending.mentorPoints,
        menteeProgress: pending.menteeProgress,
        isIncoming: true,
      };
    }

    const activeMentor = asMentor.find((m) => m.status === "active");
    if (activeMentor) {
      const mentee = await ctx.db.get("characters", activeMentor.menteeId);
      return {
        role: "mentor" as const,
        mentorshipId: activeMentor._id,
        partnerId: activeMentor.menteeId,
        partnerName: mentee?.name ?? "?",
        partnerLevel: mentee?.level ?? 0,
        status: activeMentor.status,
        mentorPoints: activeMentor.mentorPoints,
        menteeProgress: activeMentor.menteeProgress,
        isIncoming: false,
      };
    }

    return null;
  },
});

export const listMentorMentees = query({
  args: { mentorId: v.id("characters") },
  returns: v.array(v.object({
    mentorshipId: v.id("mentorships"),
    menteeName: v.string(),
    menteeLevel: v.number(),
    mentorPoints: v.number(),
    menteeProgress: v.number(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
  })),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("mentorships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();

    const results = [];
    for (const m of rows) {
      const mentee = await ctx.db.get("characters", m.menteeId);
      if (!mentee) continue;
      results.push({
        mentorshipId: m._id,
        menteeName: mentee.name,
        menteeLevel: mentee.level,
        mentorPoints: m.mentorPoints,
        menteeProgress: m.menteeProgress,
        status: m.status,
      });
    }
    return results;
  },
});
