import { ActivityEvent, BurstResult } from "../types";
import { config } from "../config";
import { findLongestStreak, sortByTs } from "./shared";

// UTC hours, for the same reason noted in weeklyDigest.ts.
function isUnsociableHour(ts: number): boolean {
  const hour = new Date(ts).getUTCHours();
  return (config.unsociableHours as readonly number[]).includes(hour);
}

/**
 * Concept A — "LLM-pace" burst detector.
 *
 * Looks at the events within the rolling window ending at `now`, finds the
 * longest contiguous run with no gap exceeding maxGapMinutes, and triggers
 * if that run has at least minEvents events. Unsociable-hours overlap only
 * adjusts messaging tone downstream — it does not gate the trigger, so the
 * detector stays reliable for scripted/seeded demo runs at any time of day.
 */
export function detectBurst(
  events: ActivityEvent[],
  now: number = Date.now()
): BurstResult | null {
  const windowStartCutoff = now - config.windowMinutes * 60_000;
  const windowed = events.filter((e) => e.ts >= windowStartCutoff && e.ts <= now);

  if (windowed.length < config.minEvents) return null;

  const streak = findLongestStreak(windowed, config.maxGapMinutes);
  const streakEvents = sortByTs(windowed).filter(
    (e) => e.ts >= streak.streakStart && e.ts <= streak.streakEnd
  );

  if (streakEvents.length < config.minEvents) return null;

  const messageCount = streakEvents.filter((e) => e.type === "message").length;
  const prCount = streakEvents.filter((e) => e.type === "pr").length;
  const unsociableHoursHit = streakEvents.some((e) => isUnsociableHour(e.ts));

  return {
    messageCount,
    prCount,
    windowStart: streak.streakStart,
    windowEnd: streak.streakEnd,
    maxGapMinutes: config.maxGapMinutes,
    unsociableHoursHit,
  };
}
