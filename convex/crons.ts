import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "rotate live events",
  { hours: 6 },
  internal.liveEvents.ensureActiveLiveEvent,
  {}
);

export default crons;
