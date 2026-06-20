import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "rotate live events",
  { hours: 6 },
  internal.liveEvents.ensureActiveLiveEvent,
  {}
);

crons.interval(
  "guild war seasons",
  { hours: 12 },
  internal.guildWarSeasons.ensureActiveGuildWarSeason,
  {}
);

crons.interval(
  "finalize guild wars",
  { hours: 1 },
  internal.guildWars.finalizeExpiredWars,
  {}
);

export default crons;
