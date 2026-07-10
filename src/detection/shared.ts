import { ActivityEvent, StreakResult } from "../types";

/**
 * Finds the longest contiguous run of events (sorted by ts) where no
 * consecutive gap exceeds maxGapMinutes. Shared by burstDetector (Concept A)
 * and weeklyDigest (Concept C) so both use identical gap-scanning logic.
 */
export function findLongestStreak(
  events: ActivityEvent[],
  maxGapMinutes: number
): StreakResult {
  const sorted = [...events].sort((a, b) => a.ts - b.ts);

  if (sorted.length === 0) {
    return { longestStreakHours: 0, streakStart: 0, streakEnd: 0 };
  }

  const maxGapMs = maxGapMinutes * 60_000;
  let bestStart = sorted[0].ts;
  let bestEnd = sorted[0].ts;
  let curStart = sorted[0].ts;
  let curEnd = sorted[0].ts;

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].ts - sorted[i - 1].ts;
    if (gap <= maxGapMs) {
      curEnd = sorted[i].ts;
    } else {
      if (curEnd - curStart > bestEnd - bestStart) {
        bestStart = curStart;
        bestEnd = curEnd;
      }
      curStart = sorted[i].ts;
      curEnd = sorted[i].ts;
    }
  }
  if (curEnd - curStart > bestEnd - bestStart) {
    bestStart = curStart;
    bestEnd = curEnd;
  }

  return {
    longestStreakHours: (bestEnd - bestStart) / 3_600_000,
    streakStart: bestStart,
    streakEnd: bestEnd,
  };
}

export function sortByTs(events: ActivityEvent[]): ActivityEvent[] {
  return [...events].sort((a, b) => a.ts - b.ts);
}
