/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as achievements from "../achievements.js";
import type * as characters from "../characters.js";
import type * as combat from "../combat.js";
import type * as cosmetics from "../cosmetics.js";
import type * as crons from "../crons.js";
import type * as dungeons from "../dungeons.js";
import type * as events from "../events.js";
import type * as friends from "../friends.js";
import type * as guildCosmetics from "../guildCosmetics.js";
import type * as guildHall from "../guildHall.js";
import type * as guildWarSeasons from "../guildWarSeasons.js";
import type * as guildWars from "../guildWars.js";
import type * as hallOfFame from "../hallOfFame.js";
import type * as havens from "../havens.js";
import type * as inventory from "../inventory.js";
import type * as lib_achievementUnlock from "../lib/achievementUnlock.js";
import type * as lib_combatEffects from "../lib/combatEffects.js";
import type * as lib_hallOfFame from "../lib/hallOfFame.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_seasonRewards from "../lib/seasonRewards.js";
import type * as lib_seasonThemes from "../lib/seasonThemes.js";
import type * as lib_spells from "../lib/spells.js";
import type * as liveEvents from "../liveEvents.js";
import type * as notifications from "../notifications.js";
import type * as presence from "../presence.js";
import type * as pvp from "../pvp.js";
import type * as pvpTournaments from "../pvpTournaments.js";
import type * as quests from "../quests.js";
import type * as raids from "../raids.js";
import type * as seasons from "../seasons.js";
import type * as social from "../social.js";
import type * as trade from "../trade.js";
import type * as worldBoss from "../worldBoss.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  achievements: typeof achievements;
  characters: typeof characters;
  combat: typeof combat;
  cosmetics: typeof cosmetics;
  crons: typeof crons;
  dungeons: typeof dungeons;
  events: typeof events;
  friends: typeof friends;
  guildCosmetics: typeof guildCosmetics;
  guildHall: typeof guildHall;
  guildWarSeasons: typeof guildWarSeasons;
  guildWars: typeof guildWars;
  hallOfFame: typeof hallOfFame;
  havens: typeof havens;
  inventory: typeof inventory;
  "lib/achievementUnlock": typeof lib_achievementUnlock;
  "lib/combatEffects": typeof lib_combatEffects;
  "lib/hallOfFame": typeof lib_hallOfFame;
  "lib/notifications": typeof lib_notifications;
  "lib/seasonRewards": typeof lib_seasonRewards;
  "lib/seasonThemes": typeof lib_seasonThemes;
  "lib/spells": typeof lib_spells;
  liveEvents: typeof liveEvents;
  notifications: typeof notifications;
  presence: typeof presence;
  pvp: typeof pvp;
  pvpTournaments: typeof pvpTournaments;
  quests: typeof quests;
  raids: typeof raids;
  seasons: typeof seasons;
  social: typeof social;
  trade: typeof trade;
  worldBoss: typeof worldBoss;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
